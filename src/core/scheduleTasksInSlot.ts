import { Temporal } from "@js-temporal/polyfill";
import type { TasksSchedule } from "../types/common";
import type {
  CalendarItem,
  CalendarTask,
  CalendarTaskUnscheduled,
} from "../types/models/calendarItem";

export const scheduleTasksInSlot = (
  queuedTasks: CalendarTaskUnscheduled[],
  activeEvents: CalendarItem[],
  slotStartTime: Temporal.PlainTime,
  slotEndTime: Temporal.PlainTime,
  date: Temporal.PlainDate,
) => {
  const busyEvents = activeEvents.filter((e) => e.isBusy);
  const sortTasks = queuedTasks.toSorted((a, b) => b.weight - a.weight);
  const startingTime =
    Temporal.PlainTime.compare(Temporal.Now.plainTimeISO(), slotStartTime) >=
      0 && date.equals(Temporal.Now.plainDateISO())
      ? Temporal.Now.plainTimeISO()
      : slotStartTime;
  // - [ ] should add creationDate property on CalenderBase. So when sorting
  // those with older creationDate will have higher priority

  /*
    I think is where I need to fix. the dueDate bug, I'll probably need to add
    a new parameter that holds the unsorted tasks now. Or maybe I can just create
    a new param dedicated to overdues?
  */
  const schedule = (
    tasksToProcess: CalendarTaskUnscheduled[],
    currentTime: Temporal.PlainTime,
    sortedTasks: CalendarTask[],
    overDueTasks: CalendarTaskUnscheduled[],
  ): TasksSchedule => {
    console.log({
      tasksToProcess: tasksToProcess.map((t) => t.id),
      currentTime: currentTime.toString(),
    });
    const [task, ...remainingTasks] = tasksToProcess;
    if (!task) {
      console.log("No more tasks to sort, Stopped scheduling tasks");
      return { sortedTasks: sortedTasks, queue: [] };
    }

    // - [ ] I should add a isOverDue property and use Temporal.Now.PlaneDateISO() instead of date
    if (Temporal.PlainDate.compare(task.dueDate.toPlainDate(), date) === -1) {
      console.log("Task is overdue. Skipping and scheduling next task.");
      return schedule(remainingTasks, currentTime, sortedTasks, [
        ...overDueTasks,
        task,
      ]);
    }

    const taskStartTime: Temporal.PlainTime = currentTime.add(task.bufferBefore);
    const taskEndTime: Temporal.PlainTime = taskStartTime.add(
      task.duration ?? { minutes: 0 },
    );
    console.log("Processing: ", {
      id: task.id,
      proposedStart: taskStartTime.toString(),
      proposedEnd: taskEndTime.toString(),
    });

    const overlappingEvent: CalendarItem | undefined = busyEvents.find(
      (e) =>
        e.start &&
        e.end &&
        Temporal.PlainTime.compare(e.end.add(e.bufferAfter), taskStartTime) === 1 &&
        Temporal.PlainTime.compare(taskEndTime, e.start.add(e.bufferBefore) ) === 1,
    );

    overlappingEvent &&
      console.log(
        "Overlaps with: ",
        overlappingEvent.id,
        " Skipped proposed time",
      );

    if (overlappingEvent && overlappingEvent.end)
      return schedule(
        tasksToProcess,
        Temporal.PlainTime.from(overlappingEvent.end.add(overlappingEvent.bufferAfter)),
        sortedTasks,
        overDueTasks,
      );

    const isSlotFull =
      Temporal.PlainTime.compare(taskEndTime, slotEndTime) === 1;

    isSlotFull && console.log("Slot is full, Stopped scheduling tasks");
    isSlotFull &&
      console.log({
        sortedTasks: sortedTasks,
        queue: [
          ...overDueTasks,
          ...remainingTasks,
          {
            ...task,
            start: null,
            end: null,
            isSorted: false,
            isBusy: false,
          },
        ],
      });

    if (isSlotFull)
      return {
        sortedTasks: sortedTasks,
        queue: [
          ...overDueTasks,
          ...remainingTasks,
          {
            ...task,
            start: null,
            end: null,
            isSorted: false,
            isBusy: false,
          },
        ],
      };

    const newTask: CalendarTask = {
      ...task,
      start: date.toPlainDateTime(taskStartTime),
      end: date.toPlainDateTime(taskEndTime),
      isBusy: true,
      isSorted: true,
    };

    console.log("Added task to schedule object. Scheduling next task");
    return schedule(
      remainingTasks,
      taskEndTime.add(task.bufferAfter),
      [...sortedTasks, newTask],
      overDueTasks,
    );
  };

  console.log("Start scheduling tasks");
  /*
    this startingTime introduced a new bug. it also sorts future tasks based on that startingTime
    the future tasks start the current time (i.e. 1PM) instead of their slot's time. hmmm though it's 
    probably only part of the problem. Maybe it can be fixed on Agenda or scheduleTask since they
    handle the per day side
  */
  console.log("Starting time at ", startingTime.toString());
  return schedule(sortTasks, startingTime, [], []);
};
