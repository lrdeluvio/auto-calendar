import type { TasksSchedule } from "../types/common";
import type { CalendarEntry, CalendarTaskUnscheduled } from "../types/models/CalendarEntry";
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
    const toSort = queuedTasks.filter((t) => t.slotId === currentSlot.id);

    if (toSort.length === 0)
      return scheduleTasksInDateRecursion(busyEntries, [...(nextSlot ? [nextSlot] : []), ...slots], sortedTasks);

    console.group("Scheduling in slot %s: %s", currentSlot.name, currentSlot.id);
    console.log("Tasks to sort: ");
    console.table(toSort, ["id", "name", "duration", "weight", "startDate", "dueDate"]);

    const doesNextSlotOverlapCurrent =
      nextSlot !== undefined && Temporal.PlainTime.compare(nextSlot.start, currentSlot.end) === -1;

    if (doesNextSlotOverlapCurrent) console.log("Slot: ", currentSlot.name, " and", nextSlot?.name, "are Overlapping");

    console.group(doesNextSlotOverlapCurrent ? "Resolving slot conflict..." : "Sorting tasks");
    const sorted: TasksSchedule = doesNextSlotOverlapCurrent
      ? resolveSlotTaskConflicts(
          currentSlot,
          nextSlot,
          queuedTasks.filter((t) => t.slotId === currentSlot.id || t.slotId === nextSlot.id),
          busyEntries,
          date,
        )
      : scheduleTasksInSlot(toSort, busyEntries, currentSlot.start, currentSlot.end, date);
    console.groupEnd();

    if (doesNextSlotOverlapCurrent) console.log("Slot conflict resolved. Scheduling next slot.");
    else console.log("Items in slot scheduled. Scheduling next slot.");
    console.groupEnd();
    
    return scheduleTasksInDateRecursion(
      [...busyEntries, ...sorted.sortedTasks],
      [...(nextSlot ? [nextSlot] : []), ...slots],
      [...sortedTasks, { sortedTasks: sorted.sortedTasks, queue: sorted.queue }],
    );
  };

  return scheduleTasksInDateRecursion(busyEntries, timeSlots, []);
};
