import { addEntry } from "../../db/queries/entries";
import type { CalendarEvent } from "../../types/models/CalendarEntry";
import { sortTasks } from "../../utils/sortTasks";

export const createEventFromForm = async (data: FormData) => {
  const start = Temporal.PlainDateTime.from(String(data.get("start")));
  const end = Temporal.PlainDateTime.from(String(data.get("end")));

  const event: Omit<CalendarEvent, "id"> = {
    type: "event",
    name: String(data.get("name")),
    notes: String(data.get("notes")),
    start: start,
    end: end,
    isBusy: true,
    isDone: false,
    isSortable: false,
    isSorted: false,
    duration: end.since(start),
    weight: 1,
    slotId: String(data.get("timeslots")),
    bufferBefore: Temporal.Duration.from({ minutes: Number(data.get("bufferBefore")) }),
    bufferAfter: Temporal.Duration.from({minutes: Number(data.get("bufferBefore"))}),
    startDate: start,
    dueDate: end,
  };
  const entryResponse = await addEntry(event);
  if (!entryResponse.ok) {
    alert(entryResponse.error);
    return;
  }

  sortTasks();
};
