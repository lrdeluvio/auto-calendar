import type { TasksSchedule } from "../types/common";
import type {
  CalendarEntry,
  CalendarTaskUnscheduled,
} from "../types/models/CalendarEntry";
import type { TimeSlot } from "../types/models/TimeSlot";
import { resolveSlotTaskConflicts } from "./resolveSlotTaskConflicts";
import { scheduleTasksInSlot } from "./scheduleTasksInSlot";

export const scheduleTasksInDate = (
  queuedTasks: CalendarTaskUnscheduled[],
  busyEntries: CalendarEntry[],
  timeSlots: TimeSlot[],
  date: Temporal.PlainDate,
): TasksSchedule[] => {
  const scheduleTasksInDateRecursion = (
    busyEntries: CalendarEntry[],
    timeSlots: TimeSlot[],
    sortedTasks: TasksSchedule[] = [],
  ) => {
    const [currentSlot, nextSlot, ...slots] = timeSlots;
    if (!currentSlot) return sortedTasks;
    const tasks = queuedTasks.filter((t) => t.slotId === currentSlot.id);
    console.log("Scheduling in slot: ", currentSlot.id);

    const areSlotsOverlapping =
      nextSlot !== undefined &&
      Temporal.PlainTime.compare(nextSlot.start, currentSlot.end) === -1;

    areSlotsOverlapping &&
      console.log(
        "Slot: ",
        currentSlot.id,
        " and",
        nextSlot?.id,
        "are Overlapping",
      );
    console.log("Resolving slot conflict...");
    const sorted: TasksSchedule = areSlotsOverlapping
      ? resolveSlotTaskConflicts(currentSlot, nextSlot, queuedTasks.filter((t) => t.slotId === currentSlot.id || nextSlot.id), busyEntries, date)
      : scheduleTasksInSlot(tasks, busyEntries, currentSlot.start, currentSlot.end, date);

    console.log("Items in slot scheduled. Scheduling next slot.");
    return scheduleTasksInDateRecursion(
      [...busyEntries, ...sorted.sortedTasks],
      [...(nextSlot ? [nextSlot] : []), ...slots],
      [
        ...sortedTasks,
        { sortedTasks: sorted.sortedTasks, queue: sorted.queue },
      ],
    );
  };

  console.log("Scheduling items in", date.toString(), "per slot");
  return scheduleTasksInDateRecursion(busyEntries, timeSlots, []);
};
