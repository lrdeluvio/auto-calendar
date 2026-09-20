import { agenda } from "../core/agenda";
import { db } from "../db/db";
import { getAllTimeSlots } from "../db/queries/slots";
import { bulkFromEntryDbModel, fromTimeSlotDbModel } from "../db/modelMappers";
import {} from "../types/common";
import { getWeekBounds } from "./getWeekBounds";
import type { CalendarTaskUnscheduled } from "../types/models/CalendarEntry";

export const sortTasks = async () => {
  const week = getWeekBounds(Temporal.Now.plainDateISO(), 2);

  const toSort = await db.events
    .filter(
      (e) =>
        e.isSortable &&
        !e.isDone &&
        e.dueDate <= week.endOfWeek.toString(),
    )
    .toArray()
    .then((arr) => bulkFromEntryDbModel(arr))
    .then((t) =>
      t.ok
        ? t.data.map(
            (t) =>
              ({
                ...t,
                start: null,
                end: null,
                isBusy: false,
                isSorted: false,
              }) as CalendarTaskUnscheduled,
          )
        : [],
    );
  /*
    Using .filter is slow, should use .where instead but since isBusy: boolean it won't work
    because of https://dexie.org/docs/Indexable-Type. Though it will be fairly easy to implement
    by just changing it to a number on EntryDbModel and using to... and from...
  */
  const busyEvents = await db.events
    .filter((e) => (e.isBusy && !e.isSortable) || (e.isBusy && e.isDone))
    .toArray()
    .then((arr) => bulkFromEntryDbModel(arr))
    .then((e) => (e.ok ? e.data : []));

  const slots = await getAllTimeSlots().then((r) =>
    r.ok ? r.data.map((s) => fromTimeSlotDbModel(s)) : [],
  );

  /* 
    FUTURE NOTE:
    - [ ] This should have an options on how many weeks it should get (i.e. 2 weeks)
    for configurations.
  */
  const ag = agenda(
    Temporal.Now.plainDateISO(),
    week.endOfWeek.toPlainDate(),
    toSort,
    busyEvents,
    slots,
  );

  const updatedScheduled = ag.sortedTasks.map((e) => {
    return {
      key: e.id,
      changes: {
        start: e.start.toString(),
        end: e.end.toString(),
        isBusy: e.isBusy,
        isSorted: e.isSortable,
      },
    };
  });

  const updatedQueue = ag.queue.map((e) => ({
    key: e.id,
    changes: {
      start: "",
      end: "",
      isBusy: e.isBusy,
      isSorted: e.isSorted,
    },
  }));

  try {
    db.events.bulkUpdate([...updatedScheduled, ...updatedQueue]);
  } catch (e) {
    console.log("on update", e);
  }
};
