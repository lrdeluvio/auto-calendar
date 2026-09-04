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
  busyEvents: CalendarEntry[],
  timeslots: TimeSlot[],
): TasksSchedule => {
  const scheduleTasksInDateInAgenda = (
    dates: Temporal.PlainDate[],
    toSort: CalendarTaskUnscheduled[],
    timeSlots: TimeSlot[],
    scheduled: CalendarTask[] = [],
  ): TasksSchedule => {
    const [date, ...rest] = dates;
    if (!date)
      return {
        sortedTasks: scheduled,
        queue: toSort,
      };

      
    /* 
      Tasks whose startDate has passed, but whose dueDate has not yet passed.
      start <= endOfDay && due >= startOfDay
    */
    const tasksInDate = toSort.filter(
      (task) =>
        Temporal.PlainDateTime.compare(task.startDate, date.toPlainDateTime("23:59")) <= 0 &&
        Temporal.PlainDateTime.compare(task.dueDate, date.toPlainDateTime("00:00")) >= 0,
    );

    if (toSort.length === 0) {
      console.log("No more tasks to sort in the agenda.");
      return {
        sortedTasks: scheduled,
        queue: toSort,
      };
    }

    console.group("Scheduling items in", date.toString(), "per slot");
    console.log("Tasks to be sorted: ", tasksInDate);
    const scheduleTasksInDateInDate = scheduleTasksInDate(
      tasksInDate,
      busyEvents.filter((e) => e.start && date.equals(e.start?.toPlainDate())),
      timeSlots,
      date,
    );

    console.log("Finished scheduling tasks per slot in ", date.toString());
    const flatten = scheduleTasksInDateInDate.reduce<CalendarTask[]>((acc, curr) => [...acc, ...curr.sortedTasks], []);
    console.groupEnd();
    const queue = toSort.filter((task) => !flatten.some((task2) => task.id === task2.id));

    return scheduleTasksInDateInAgenda(rest, queue, timeSlots, [...scheduled, ...flatten]);
  };

  console.log(
    "%cScheduling tasks from %s to %s",
    "font-size: 16px; font-weight: bold;",
    startDate.toString(),
    endDate.toString(),
  );
  return scheduleTasksInDateInAgenda(eachDayOfInterval(startDate, endDate), tasksToSort, timeslots);
};
