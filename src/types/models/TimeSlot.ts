import { Temporal } from "@js-temporal/polyfill";

export interface TimeSlot {
  id: string;
  name: string;
  start: Temporal.PlainTime;
  end: Temporal.PlainTime;
}
