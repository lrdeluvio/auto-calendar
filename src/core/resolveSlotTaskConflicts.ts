import type { CalendarEntry, CalendarTask, CalendarTaskUnscheduled } from "../types/models/CalendarEntry";
import type { TimeSlot } from "../types/models/TimeSlot";
import { scheduleTasksInSlot } from "./scheduleTasksInSlot";

export const resolveSlotTaskConflicts = (
  timeslotA: TimeSlot,
  timeslotB: TimeSlot,
  tasks: CalendarTaskUnscheduled[],
  busyEntries: CalendarEntry[],
  date: Temporal.PlainDate,
) => {
  const sortedTasksByWeight = tasks.toSorted((a, b) => {
    if (a.weight !== b.weight) return b.weight - a.weight;

    const dateRangeA = a.dueDate.since(a.startDate).days;
    const dateRangeB = b.dueDate.since(b.startDate).days;
    return dateRangeA - dateRangeB;
  });

  const recursion = (
    toSort: CalendarTaskUnscheduled[],
    sorted: CalendarTask[] = [],
    queue: CalendarTaskUnscheduled[] = [],
  ) => {
    const [task, ...rest] = toSort;
    if (!task)
      return {
        sortedTasks: sorted.filter((t) => t.slotId === timeslotA.id),
        queue: queue.filter((t) => t.slotId === timeslotA.id),
      };
    
    const slot = task.slotId === timeslotA.id ? timeslotA : timeslotB;
    const result = scheduleTasksInSlot([task], [...busyEntries, ...sorted], slot.start, slot.end, date);

    return recursion(rest, [...sorted, ...result.sortedTasks], [...queue, ...result.queue]);
  };

  return recursion(sortedTasksByWeight);
};
