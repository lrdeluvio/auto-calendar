import { Temporal } from "@js-temporal/polyfill";
import { db } from "../../db/db";
import { addEntry } from "../../db/queries/entries";
import type { Weight } from "../../types/common";
import type {
  CalendarTaskUnscheduled,
  CalendarTask,
} from "../../types/models/CalendarEntry";
import { sortTasks } from "../../utils/sortTasks";

export const createTaskFromForm = async (data: FormData) => {
  const baseTask = {
    type: "task",
    name: String(data.get("name")),
    notes: String(data.get("notes")),
    isBusy: false,
    isDone: false,
    isSorted: false,
    weight: Number(data.get("weight")) as Weight,
    slotId: String(data.get("slotId")),
    bufferBefore: Temporal.Duration.from({
      minutes: Number(data.get("bufferBefore")),
    }),
    bufferAfter: Temporal.Duration.from({
      minutes: Number(data.get("bufferBefore")),
    })
  } as const;

  const task: Omit<CalendarTaskUnscheduled, "id"> | Omit<CalendarTask, "id"> =
    Boolean(data.get("isSortable") === "on")
      ? {
          ...baseTask,
          start: null,
          end: null,
          isSortable: true,
          duration: Temporal.Duration.from({
            minutes: Number(data.get("duration")),
          }),
          startDate: Temporal.PlainDateTime.from(String(data.get("startDate"))),
          dueDate: Temporal.PlainDateTime.from(String(data.get("dueDate"))),
        }
      : {
          ...baseTask,
          start: Temporal.PlainDateTime.from(String(data.get("start"))),
          end: Temporal.PlainDateTime.from(String(data.get("end"))),
          isSortable: false,
          duration: Temporal.PlainDateTime.from(String(data.get("end"))).since(
            Temporal.PlainDateTime.from(String(data.get("start"))),
          ),
          startDate: Temporal.PlainDateTime.from(String(data.get("start"))),
          dueDate: Temporal.PlainDateTime.from(String(data.get("end"))),
        };
  const entryResponse = await addEntry(task);

  if (!entryResponse.ok) {
    alert(entryResponse.error);
    return;
  }

  sortTasks();
};
export const updateTaskFromForm = async (data: FormData, id: string) => {
  const update = {
    name: String(data.get("name")),
    isSortable: data.get("isSortable") === "on",
    weight: Number(data.get("weight")) as Weight,
    bufferBefore: Temporal.Duration.from({
      minutes: Number(data.get("bufferBefore")),
    }).toString(),
    bufferAfter: Temporal.Duration.from({
      minutes: Number(data.get("bufferAfter")),
    }).toString(),
    ...(data.get("duration")
      ? {
          duration: Temporal.Duration.from({
            minutes: Number(data.get("duration")),
          }).toString(),
        }
      : {}),
    ...(data.get("start")
      ? {
          start: Temporal.PlainDateTime.from(
            String(data.get("start")),
          ).toString(),
        }
      : {}),
    ...(data.get("end")
      ? {
          end: Temporal.PlainDateTime.from(String(data.get("end"))).toString(),
        }
      : {}),
    ...(data.get("timeslots")
      ? {
          slotId: String(data.get("timeslots")),
        }
      : {}),
    ...(data.get("startDate")
      ? {
          startDate: Temporal.PlainDate.from(
            String(data.get("startDate")),
          ).toString(),
        }
      : {}),
    ...(data.get("dueDate")
      ? {
          dueDate: Temporal.PlainDate.from(
            String(data.get("dueDate")),
          ).toString(),
        }
      : {}),
  };
  try {
    await db.events.update(id, update);
    sortTasks();
  } catch (e) {
    console.warn(e);
  }
};
