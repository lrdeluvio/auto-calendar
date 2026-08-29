import { addEntry } from "../../db/queries/entries";
import type { Result } from "../../types/common";
import { sortTasks } from "../../utils/sortTasks";
import * as z from "zod";

const eventEntryFormModel = z.object({
  name: z.string(),
  notes: z.string(),

  start: z.iso.datetime({ local: true }).transform((d) => Temporal.PlainDateTime.from(d)),
  end: z.iso.datetime({ local: true }).transform((d) => Temporal.PlainDateTime.from(d)),

  bufferBefore: z.coerce
    .number()
    .min(0)
    .transform((d) => Temporal.Duration.from({ minutes: d })),
  bufferAfter: z.coerce
    .number()
    .min(0)
    .transform((d) => Temporal.Duration.from({ minutes: d })),
});

export const createEventFromForm = async (data: FormData): Promise<Result<string, string>> => {
  const parseResult = eventEntryFormModel.safeParse(Object.fromEntries(data));
  if (parseResult.error) return { ok: false, error: JSON.stringify(parseResult.error) };

  const { start, end } = parseResult.data;
  const saveResult = await addEntry({
    type: "event",
    isBusy: true,
    isDone: false,
    isSortable: false,
    isSorted: false,
    duration: end.since(start),
    weight: 1,
    startDate: start,
    dueDate: end,
    slotId: "",
    ...parseResult.data,
  });

  if (!saveResult.ok) return saveResult;

  sortTasks();
  return saveResult;
};
