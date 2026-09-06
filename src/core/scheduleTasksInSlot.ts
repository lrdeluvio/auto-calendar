import type { TasksSchedule } from "../types/common";
import type {
  CalendarEntry,
  CalendarTask,
  CalendarTaskUnscheduled,
} from "../types/models/CalendarEntry";

export const scheduleTasksInSlot = (
  queuedTasks: CalendarTaskUnscheduled[],
  busyEntries: CalendarEntry[],
  slotStartTime: Temporal.PlainTime,
  slotEndTime: Temporal.PlainTime,
  date: Temporal.PlainDate,
) => {
  // Check if it's already past the slot's time.
  if (Temporal.PlainDateTime.compare(Temporal.Now.plainDateTimeISO(), date.toPlainDateTime(slotEndTime)) === 1)
    return {
      sortedTasks: [],
      queue: queuedTasks,
    };

  const sortedTasksByWeight = queuedTasks.toSorted((a, b) => b.weight - a.weight);

  /*
    if date is today and the start has already past, use the current time as start time,
    if not use the slot's start time (specifically for tasks not sorted today)
  */
  const startingTime =
    date.equals(Temporal.Now.plainDateISO()) &&
    Temporal.PlainTime.compare(Temporal.Now.plainTimeISO(), slotStartTime) >= 0
      ? Temporal.Now.plainTimeISO().round("minute")
      : slotStartTime;

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
      return { sortedTasks: sortedTasks, queue: overDueTasks };
    }
    console.log("Current time: %s | Sorting %s", currentTime, task.id);

    /*
      If the current task can't be started yet, move it after the next start, 
      sort the next task first, then attempt to sort the current task again.
    */
    if (Temporal.PlainDateTime.compare(task.startDate, date.toPlainDateTime(currentTime)) === 1) {
      console.log("Task can't be started yet, skipping for now.");
      if (remainingTasks.length === 0) return schedule([task], task.startDate.toPlainTime(), sortedTasks, overDueTasks);

      // move task inside remainigTasks after remainingTasks[0]
      return schedule(remainingTasks.toSpliced(1, 0, task), currentTime, sortedTasks, overDueTasks);
    }

    if (Temporal.PlainDateTime.compare(task.dueDate, date.toPlainDateTime(currentTime)) === -1) {
      console.log("Task is overdue. Skipping and scheduling next task.");
      return schedule(remainingTasks, currentTime, sortedTasks, [...overDueTasks, task]);
    }

    const taskStartTime: Temporal.PlainTime = currentTime.add(task.bufferBefore);
    const taskEndTime: Temporal.PlainTime = taskStartTime.add(task.duration);
    console.log("Processing %s: ", task.id, {
      proposedStart: taskStartTime.toString(),
      proposedEnd: taskEndTime.toString(),
    });

    /*
      Finds a busy entry that will overlap with the proposed task's time.
      entryEnd > taskStartTime && taskEndTime > entryStart
    */
    const overlappingEntry: CalendarEntry | undefined = busyEntries.find((e) => {
      if (!e.start || !e.end) return false;
      return (
        Temporal.PlainTime.compare(e.end.add(e.bufferAfter), taskStartTime) === 1 &&
        Temporal.PlainTime.compare(taskEndTime, e.start.add(e.bufferBefore)) === 1
      );
    });

    // Moves the timeslot time tracker to the end of the overlapping entry
    if (overlappingEntry && overlappingEntry.end) {
      console.log("Overlaps with: ", overlappingEntry.id, " Skipped proposed time");
      return schedule(
        tasksToProcess,
        Temporal.PlainTime.from(overlappingEntry.end.add(overlappingEntry.bufferAfter)),
        sortedTasks,
        overDueTasks,
      );
    }

    // Checks if the proposed time will go past the slot's time.
    const isSlotFull = Temporal.PlainTime.compare(taskEndTime, slotEndTime) === 1;
    if (isSlotFull) {
      const result = {
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

      // maybe this should't immediately stop the scheduuling?
      // because what if there are still tasks that can fit on the remaining time?
      // something like this:
      /**
       * const durationLeftInSlot = durationOfSlot - currentTime
       * const tasksFitInDuration = remainingTasks.map((t) => t.duration <= durationLeftInSlot)
       * 
       * schedule(tasksFitInDuration, currentTime, sortedTasks, [...overdueTasks, currentTask, !tasksFitInDuration])
       */

      console.log("Slot is full, Stopped scheduling tasks");
      console.log(result);
      return result;
    }

    const newTask: CalendarTask = {
      ...task,
      start: date.toPlainDateTime(taskStartTime),
      end: date.toPlainDateTime(taskEndTime),
      isBusy: true,
      isSorted: true,
    };
    console.log("Succesfully added task. Scheduling next task...");
    return schedule(remainingTasks, taskEndTime.add(task.bufferAfter), [...sortedTasks, newTask], overDueTasks);
  };

  return schedule(sortedTasksByWeight, startingTime, [], []);
};
