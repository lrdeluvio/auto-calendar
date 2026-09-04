import type { TasksSchedule } from "../types/common";
import type { CalendarEntry, CalendarTaskUnscheduled } from "../types/models/CalendarEntry";
import type { TimeSlot } from "../types/models/TimeSlot";
import { scheduleTasksInSlot } from "./scheduleTasksInSlot";

export const resolveSlotTaskConflicts = (
  timeslotA: TimeSlot,
  timeslotB: TimeSlot,
  tasks: CalendarTaskUnscheduled[],
  busyEntries: CalendarEntry[],
  date: Temporal.PlainDate,
): TasksSchedule => {
  const maxTimeslotEnd = Temporal.PlainTime.compare(timeslotA.end, timeslotB.end) === 1 ? timeslotA.end : timeslotB.end
  const merge = scheduleTasksInSlot(tasks, busyEntries, timeslotA.start, maxTimeslotEnd, date);
  return {
    sortedTasks: merge.sortedTasks.filter((t) => t.slotId === timeslotA.id),
    queue: merge.queue.filter((t) => t.slotId === timeslotA.id),
  };
};