import type { Result } from "../../types/common";
import type {
  CalendarEvent,
  CalendarTask,
  CalendarTaskUnscheduled,
} from "../../types/models/CalendarEntry";
import { db } from "../db";
import { toEntryDbModel } from "../modelMappers";

type CalendarEntryWithoutId =
  | Omit<CalendarEvent, "id">
  | Omit<CalendarTask, "id">
  | Omit<CalendarTaskUnscheduled, "id">;

export const addEntry = async (
  entry: CalendarEntryWithoutId,
): Promise<Result<string, "INVALID_DATE_RANGE" | string>> => {
  if (
    entry.startDate &&
    entry.dueDate &&
    Temporal.PlainDateTime.compare(entry.startDate, entry.dueDate) === 1
  )
    return { ok: false, error: "INVALID_DATE_RANGE" };

  const newEntry = {
    ...entry,
    id: crypto.randomUUID(),
  };

  try {
    await db.events.add(toEntryDbModel(newEntry));
    return { ok: true, data: newEntry.id };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
};

// add deleteEvent
export const deleteEntry = async (
  itemId: string,
): Promise<Result<string, "NO_ID_MATCH">> => {
  try {
    await db.events.delete(itemId);
    return { ok: true, data: itemId };
  } catch (error) {
    return { ok: false, error: "NO_ID_MATCH" };
  }
};
