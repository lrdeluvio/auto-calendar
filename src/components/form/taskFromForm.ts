import { db } from "../../db/db";
import { addEntry } from "../../db/queries/entries";
import type { Result, Weight } from "../../types/common";
import type { CalendarTaskUnscheduled, CalendarTask } from "../../types/models/CalendarEntry";
import { sortTasks } from "../../utils/sortTasks";
import * as z from "zod";

const baseTaskEntryFormModel = z.object({
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
});

const taskEntryFormModel = z.discriminatedUnion("isSortable", [
  baseTaskEntryFormModel.safeExtend({
    isSortable: z.literal(true),
    slotId: z.uuidv4(),
    startDate: z.iso.datetime({ local: true }).transform((d) => Temporal.PlainDateTime.from(d)),
    dueDate: z.iso.datetime({ local: true }).transform((d) => Temporal.PlainDateTime.from(d)),
    duration: z
      .union([z.coerce.number(), z.iso.duration()])
      .transform((d) => (typeof d === "number" ? Temporal.Duration.from({ minutes: d }) : Temporal.Duration.from(d))),
  }),
  baseTaskEntryFormModel.safeExtend({
    isSortable: z.literal(false),
    start: z.iso.datetime({ local: true }).transform((d) => Temporal.PlainDateTime.from(d)),
    end: z.iso.datetime({ local: true }).transform((d) => Temporal.PlainDateTime.from(d)),
  }),
]);

export const createTaskFromForm = async (data: FormData): Promise<Result<string, string>> => {
  const parseResult = taskEntryFormModel.safeParse(
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
    isBusy: false,
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
export const updateTaskFromForm = async (data: FormData, id: string) => {
  const update = {
    name: String(data.get("name")),
    isSortable: data.get("isSortable") === "on",
    weight: Number(data.get("weight")) as Weight,
    bufferBefore: Temporal.Duration.from({
      minutes: Number(data.get("bufferBefore")),
    }).toString(),
    bufferAfter: Temporal.Duration.from({
      minutes: Number(data.get("bufferAfter")),
    }).toString(),
    ...(data.get("duration")
      ? {
          duration: Temporal.Duration.from({
            minutes: Number(data.get("duration")),
          }).toString(),
        }
      : {}),
    ...(data.get("start")
      ? {
          start: Temporal.PlainDateTime.from(String(data.get("start"))).toString(),
        }
      : {}),
    ...(data.get("end")
      ? {
          end: Temporal.PlainDateTime.from(String(data.get("end"))).toString(),
        }
      : {}),
    ...(data.get("timeslots")
      ? {
          slotId: String(data.get("timeslots")),
        }
      : {}),
    ...(data.get("startDate")
      ? {
          startDate: Temporal.PlainDate.from(String(data.get("startDate"))).toString(),
        }
      : {}),
    ...(data.get("dueDate")
      ? {
          dueDate: Temporal.PlainDate.from(String(data.get("dueDate"))).toString(),
        }
      : {}),
  };
  try {
    await db.events.update(id, update);
    sortTasks();
  } catch (e) {
    console.warn(e);
  }
};
