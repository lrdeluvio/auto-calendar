import type { Weight } from "../types/common";
import * as z from "zod";

export const timeslotDbModel = z.object({
  id: z.uuidv4(),
  name: z.string(),
  start: z.iso.time(),
  end: z.iso.time(),
});
export type TimeSlotDbModel = z.infer<typeof timeslotDbModel>;

export const entryDbModel = z.object({
  type: z.literal(["event", "task"]),
  id: z.uuidv4(),
  name: z.string(),
  notes: z.string(),
// need to add {local: true} to iso stuff
  start: z.iso.datetime(),
  end: z.iso.datetime(),

  isBusy: z.boolean(),
  isDone: z.boolean(),
  isSortable: z.boolean(),
  isSorted: z.boolean(),

  duration: z.preprocess((val) => {
    const num = Number(val);
    if (!Number.isNaN(num)) return `PT${num}M`;
    return val;
  }, z.iso.duration()),
  weight: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  slotId: z.uuidv4(),

  bufferBefore: z.iso.time(),
  bufferAfter: z.iso.time(),

  startDate: z.iso.datetime(),
  dueDate: z.iso.datetime(),
});

export type EntryDbModel = z.infer<typeof entryDbModel>;
