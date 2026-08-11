import type { CalendarTask, CalendarTaskUnscheduled } from "./models/CalendarEntry";

export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export type SlotError = "INVALID_RANGE" | "TIME_EXCEEDED";

export type Weight = 1 | 2 | 3 | 4;

export interface TasksSchedule {
  sortedTasks: CalendarTask[];
  queue: CalendarTaskUnscheduled[];
}
