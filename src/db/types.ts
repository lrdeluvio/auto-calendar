import type { Weight } from "../types/common";

export interface TimeSlotDbModel {
  id: string;
  name: string;
  start: string;
  end: string;
}

export interface EntryDbModel {
  type: "event" | "task";
  id: string;
  name: string;
  notes: string;

  start: string; // date-time in the RFC 9557 format
  end: string; // date-time in the RFC 9557 format

  isBusy: boolean;
  isDone: boolean;
  isSortable: boolean;
  isSorted: boolean;

  duration: string; // duration in the ISO 8601 format
  weight: Weight;
  slotId: string;

  bufferBefore: string; // duration in the ISO 8601 format
  bufferAfter: string; // duration in the ISO 8601 format

  startDate: string; //  date-time in the RFC 9557 format
  dueDate: string; //  date-time in the RFC 9557 format
}
