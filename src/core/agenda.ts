import type { TasksSchedule } from "../types/common";
import type { CalendarEntry, CalendarTask, CalendarTaskUnscheduled } from "../types/models/CalendarEntry";
import type { TimeSlot } from "../types/models/TimeSlot";
import { scheduleTasksInDate } from "./scheduleTasksInDate";

export const eachDayOfInterval = (start: Temporal.PlainDate, end: Temporal.PlainDate): Temporal.PlainDate[] => {
  const totalDays = start.until(end, { largestUnit: "day" }).days;
  if (totalDays < 0) return [];

  return Array.from({ length: totalDays + 1 }, (_, index) => start.add({ days: index }));
};

export const agenda = (
  startDate: Temporal.PlainDate,
  endDate: Temporal.PlainDate,
  tasksToSort: CalendarTaskUnscheduled[],
  busyEntries: CalendarEntry[],
  timeslots: TimeSlot[],
): TasksSchedule => {
  const scheduleTasksInDateInAgenda = (
    dates: Temporal.PlainDate[],
    toSort: CalendarTaskUnscheduled[],
    timeSlots: TimeSlot[],
    scheduled: CalendarTask[] = [],
    queue: CalendarTaskUnscheduled[] = [],
  ): TasksSchedule => {
    const [date, ...rest] = dates;
    if (!date) {
      console.log("No more dates to go through.");
      return {
        sortedTasks: scheduled,
        queue: queue,
      };
    }

    if (toSort.length === 0) {
      console.log("No more tasks to sort in the agenda.");
      return {
        sortedTasks: scheduled,
        queue: queue,
      };
    }

    /* 
      Tasks whose startDate has passed, but whose dueDate has not yet passed.
      start <= endOfDay && due >= startOfDay
    */
    const tasksInDate = toSort.filter(
      (task) =>
        Temporal.PlainDateTime.compare(task.startDate, date.toPlainDateTime("23:59")) <= 0 &&
        Temporal.PlainDateTime.compare(task.dueDate, date.toPlainDateTime("00:00")) >= 0,
    );

    console.group("Scheduling items in %s per slot", date.toString());
    console.log("Tasks to be sorted: ");
    console.table(tasksInDate, ["id", "name", "duration", "weight", "slotId", "startDate", "dueDate"]);

    const scheduledTasks = scheduleTasksInDate(
      tasksInDate,
      busyEntries.filter((e) => e.start && date.equals(e.start.toPlainDate())),
      timeSlots,
      date,
    );

    console.log("Finished scheduling tasks per slot in %s", date.toString());
    console.groupEnd();

    const sortedTasks = scheduledTasks.flatMap((t) => t.sortedTasks);
    const sortedQueue = scheduledTasks.flatMap((t) => t.queue);
   
    /*
      toSort: filter outs the tasks from sortedTasks
      queue: filter outs the tasks that can still be sorted in a different day
    */
    return scheduleTasksInDateInAgenda(
      rest,
      toSort.filter((t) => !sortedTasks.some((v) => v.id === t.id)),
      timeSlots,
      [...scheduled, ...sortedTasks],
      [...queue, ...sortedQueue.filter((t) => t.dueDate.toPlainDate().equals(date))],
    );
  };

  console.log("%cScheduling tasks from %s to %s", "font-size: 16px;", startDate.toString(), endDate.toString());
  return scheduleTasksInDateInAgenda(eachDayOfInterval(startDate, endDate), tasksToSort, timeslots);
};
