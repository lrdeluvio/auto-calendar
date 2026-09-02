import type { Weight } from "../common";

interface BaseEntry {
  id: string;
  name: string;
  notes: string;

  isBusy: boolean;
  isDone: boolean;
  isSortable: boolean;
  isSorted: boolean;

  duration: Temporal.Duration;
  weight: Weight;
  slotId: string;

  bufferBefore: Temporal.Duration;
  bufferAfter: Temporal.Duration;

  startDate: Temporal.PlainDateTime;
  dueDate: Temporal.PlainDateTime;

  color: string;
}

export type CalendarEntryType = "event" | "task"

export interface CalendarEvent extends BaseEntry {
  type: "event";
  start: Temporal.PlainDateTime;
  end: Temporal.PlainDateTime;
}

export interface CalendarTask extends BaseEntry {
  type: "task";
  start: Temporal.PlainDateTime;
  end: Temporal.PlainDateTime;
}

export interface CalendarTaskUnscheduled extends BaseEntry {
  type: "task";
  start: null;
  end: null;
}

export type CalendarEntry = CalendarEvent | CalendarTask | CalendarTaskUnscheduled;
