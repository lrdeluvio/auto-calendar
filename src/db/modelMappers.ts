import { Temporal } from "@js-temporal/polyfill";
import type {
  CalendarEvent,
  CalendarEntry,
  CalendarTask,
} from "../types/models/CalendarEntry";
import type { TimeSlot } from "../types/models/TimeSlot";
import type { TimeSlotDbModel, EntryDbModel } from "./types";
import type { Result } from "../types/common";

export const toTimeSlotDbModel = (slot: TimeSlot): TimeSlotDbModel => ({
  ...slot,
  start: slot.start.toString(),
  end: slot.end.toString(),
});

export const fromTimeSlotDbModel = (slot: TimeSlotDbModel): TimeSlot => ({
  ...slot,
  start: Temporal.PlainTime.from(slot.start),
  end: Temporal.PlainTime.from(slot.end),
});

export const toEntryDbModel = (event: CalendarEntry): EntryDbModel => ({
  ...event,
  start: event.start?.toString() ?? "",
  end: event.end?.toString() ?? "",
  duration: event.duration?.toString(),
  bufferBefore: event.bufferBefore?.toString(),
  bufferAfter: event.bufferAfter?.toString(),
  startDate: event.startDate?.toString() ?? "",
  dueDate: event.dueDate?.toString() ?? "",
});

type FromEntryDbModelError = "MISSING_INTERVAL" | "INVALID_INTERVAL_PAIRS";

export const fromEntryDbModel = (
  event: EntryDbModel,
): Result<CalendarEntry, FromEntryDbModelError> => {
  const base = {
    id: event.id,
    name: event.name,
    notes: event.notes,
    isBusy: event.isBusy,
    isDone: event.isDone,
    isSortable: event.isSortable,
    isSorted: event.isSorted,
    duration: Temporal.Duration.from(event.duration),
    weight: event.weight,
    slotId: event.slotId,
    bufferBefore: Temporal.Duration.from(event.bufferBefore),
    bufferAfter: Temporal.Duration.from(event.bufferAfter),
    startDate: Temporal.PlainDateTime.from(event.startDate),
    dueDate: Temporal.PlainDateTime.from(event.dueDate),
  };

  const start = event.start ? Temporal.PlainDateTime.from(event.start) : null;
  const end = event.end ? Temporal.PlainDateTime.from(event.end) : null;

  if (event.type === "event") {
    if (!start || !end) return { ok: false, error: "MISSING_INTERVAL" };

    return {
      ok: true,
      data: {
        ...base,
        type: "event",
        start,
        end,
      } as CalendarEvent,
    };
  }

  if ((start && !end) || (!start && end))
    return { ok: false, error: "INVALID_INTERVAL_PAIRS" };

  return {
    ok: true,
    data: {
      ...base,
      type: "task",
      start,
      end,
    } as CalendarTask,
  };
};

export const bulkFromEntryDbModel = (
  event: EntryDbModel[],
): Result<CalendarEntry[], FromEntryDbModelError> => {
  const result: CalendarEntry[] = [];

  for (const item of event) {
    const x = fromEntryDbModel(item);
    if (!x.ok) return { ok: false, error: x.error };
    result.push(x.data);
  }

  return { ok: true, data: result };
};
