import { db } from "../../db/db";
import { addEntry } from "../../db/queries/entries";
import type { EntryDbModel } from "../../db/types";
import type { Result, Weight } from "../../types/common";
import type { CalendarTaskUnscheduled, CalendarTask } from "../../types/models/CalendarEntry";
import { sortTasks } from "../../utils/sortTasks";
import * as z from "zod";

const baseTaskEntryFormSchema = z.object({
  name: z.string(),
  notes: z.string(),

  weight: z.coerce
    .number()
    .pipe(z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])) as z.ZodType<Weight>,

  bufferBefore: z.coerce
    .number()
    .min(0)
    .transform((d) => Temporal.Duration.from({ minutes: d })),
  bufferAfter: z.coerce
    .number()
    .min(0)
    .transform((d) => Temporal.Duration.from({ minutes: d })),

  isBusy: z.coerce.boolean(),
  color: z.string(),
});

const taskEntryFormSchema = z.discriminatedUnion("isSortable", [
  baseTaskEntryFormSchema.safeExtend({
    isSortable: z.literal(true),
    slotId: z.uuidv4(),
    startDate: z.iso.datetime({ local: true }).transform((d) => Temporal.PlainDateTime.from(d)),
    dueDate: z.iso.datetime({ local: true }).transform((d) => Temporal.PlainDateTime.from(d)),
    duration: z
      .union([z.coerce.number(), z.iso.duration()])
      .transform((d) => (typeof d === "number" ? Temporal.Duration.from({ minutes: d }) : Temporal.Duration.from(d))),
  }),
  baseTaskEntryFormSchema.safeExtend({
    isSortable: z.literal(false),
    start: z.iso.datetime({ local: true }).transform((d) => Temporal.PlainDateTime.from(d)),
    end: z.iso.datetime({ local: true }).transform((d) => Temporal.PlainDateTime.from(d)),
  }),
]);

export const createTaskFromForm = async (data: FormData): Promise<Result<string, string>> => {
  const parseResult = taskEntryFormSchema.safeParse(
    Object.fromEntries(
      [...data.entries()].map(([key, value]) => [
        key,
        key === "isSortable" ? (value === "true" ? true : value === "false" ? false : value) : value,
      ]),
    ),
  );
  if (parseResult.error) return { ok: false, error: JSON.stringify(parseResult.error) };

  const baseTask = {
    type: "task",
    isDone: false,
    isSorted: false,
    ...parseResult.data,
  } as const;

  const task: Omit<CalendarTaskUnscheduled, "id"> | Omit<CalendarTask, "id"> = baseTask.isSortable
    ? {
        start: null,
        end: null,
        ...baseTask,
      }
    : {
        slotId: "",
        startDate: baseTask.start,
        dueDate: baseTask.end,
        duration: baseTask.end.since(baseTask.start),
        ...baseTask,
      };

  const saveResult = await addEntry(task);

  if (!saveResult.ok) return saveResult;

  sortTasks();
  return saveResult;
};

export const updateTaskFromForm = async (data: FormData, id: string): Promise<Result<string, string>> => {
  const update: Partial<EntryDbModel> = {
    name: String(data.get("name")),
    isSortable: data.getAll("isSortable").includes("true") ? true : false,
    isBusy: data.get("isBusy") === "on" ? true : false,
    weight: Number(data.get("weight")) as Weight,
    bufferBefore: Temporal.Duration.from({
      minutes: Number(data.get("bufferBefore")),
    }).toString(),
    bufferAfter: Temporal.Duration.from({
      minutes: Number(data.get("bufferAfter")),
    }).toString(),
    notes: String(data.get("notes")),
    color: String(data.get("color")),
    ...(data.get("duration")
      ? {
          duration: Temporal.Duration.from({
            minutes: Number(data.get("duration")),
          }).toString(),
        }
      : {}),
    ...(data.get("start")
      ? {
          start: Temporal.PlainDateTime.from(String(data.get("start")))
            .round("minute")
            .toString(),
        }
      : {}),
    ...(data.get("end")
      ? {
          end: Temporal.PlainDateTime.from(String(data.get("end")))
            .round("minute")
            .toString(),
        }
      : {}),
    ...(data.get("slotId")
      ? {
          slotId: String(data.get("slotId")),
        }
      : {}),
    ...(data.get("startDate")
      ? {
          startDate: Temporal.PlainDateTime.from(String(data.get("startDate")))
            .round("minute")
            .toString(),
        }
      : {}),
    ...(data.get("dueDate")
      ? {
          dueDate: Temporal.PlainDateTime.from(String(data.get("dueDate")))
            .round("minute")
            .toString(),
        }
      : {}),
  };

  try {
    await db.events.update(id, update);
    sortTasks();
    return { ok: true, data: id };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
};
