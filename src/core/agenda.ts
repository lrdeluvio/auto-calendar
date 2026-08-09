import { Temporal } from "@js-temporal/polyfill";
import type { TasksSchedule } from "../types/common";
import type {
  CalendarItem,
  CalendarTask,
  CalendarTaskUnscheduled,
} from "../types/models/calendarItem";
import type { TimeSlot } from "../types/models/timeslot";
import { scheduleTasks } from "./scheduleTasks";

export const eachDayOfInterval = (
  start: Temporal.PlainDate,
  end: Temporal.PlainDate,
): Temporal.PlainDate[] => {
  const totalDays = start.until(end, { largestUnit: "day" }).days;

  if (totalDays < 0) return [];

  return Array.from({ length: totalDays + 1 }, (_, index) =>
    start.add({ days: index }),
  );
};

export const agenda = (
  start: Temporal.PlainDate,
  end: Temporal.PlainDate,
  allTasks: CalendarTaskUnscheduled[],
  busyEvents: CalendarItem[],
  timeSlots: TimeSlot[],
): TasksSchedule => {
  const scheduleTasksInAgenda = (
    dates: Temporal.PlainDate[],
    allTasks: CalendarTaskUnscheduled[],
    timeSlots: TimeSlot[],
    scheduled: CalendarTask[] = [],
  ): TasksSchedule => {
    const [date, ...rest] = dates;
    if (!date)
      return {
        sortedTasks: scheduled ?? [],
        queue: allTasks,
      };

    const tasksInDate = allTasks.filter((task) => {
      return (
        Temporal.PlainDateTime.compare(task.startDate ?? {}, date) === -1 ||
        (task.startDate?.equals(date) && task.dueDate?.equals(date))
      );
    });

    const scheduleTasksInDate = scheduleTasks(
      tasksInDate,
      busyEvents.filter((e) => e.start && date.equals(e.start?.toPlainDate())),
      timeSlots,
      date,
    );

    console.log("Finished scheduling tasks per slot in ", date.toString());
    const flatten = scheduleTasksInDate.reduce<CalendarTask[]>(
      (acc, curr) => [...acc, ...curr.sortedTasks],
      [],
    );

    const queue = allTasks.filter(
      (task) => !flatten.some((task2) => task.id === task2.id),
    );

    return scheduleTasksInAgenda(rest, queue, timeSlots, [
      ...scheduled,
      ...flatten,
    ]);
  };
  return scheduleTasksInAgenda(
    eachDayOfInterval(start, end),
    allTasks,
    timeSlots,
  );
};
