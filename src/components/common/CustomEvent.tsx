import NiceModal from "@ebay/nice-modal-react";
import { db } from "../../db/db";
import type { EntryDbModel } from "../../db/types";
import { sortTasks } from "../../utils/sortTasks";
import { EditEntryModal } from "../modals/EditEntryModal";

export const CustomEvent = ({ event }: { event: EntryDbModel }) => {
  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const currentDateTime = Temporal.Now.plainDateTimeISO().round("minute");
    const start = Temporal.PlainDateTime.from(event.start).round("minute");
    const end = Temporal.PlainDateTime.from(event.end).round("minute");

    const isEventPastCurrDateTime = Temporal.PlainDateTime.compare(start, currentDateTime) <= 0;
    const isCurrDateTimeInEvent = isEventPastCurrDateTime && Temporal.PlainDateTime.compare(currentDateTime, end) <= 0;

    try {
      await db.events.update(event.id, {
        isDone: e.target.checked,
        ...(isEventPastCurrDateTime || isCurrDateTimeInEvent
          ? {
              end: currentDateTime.toString(),
              start: currentDateTime.subtract(event.duration).toString(),
            }
          : {}),
      });
      await sortTasks();
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <>
      <button
        style={{ backgroundColor: event.color, width: "100%", height: "100%" }}
        onClick={() => {
          NiceModal.show(EditEntryModal, { entry: event });
        }}
      >
        {event.type === "task" && (
          <input
            type="checkbox"
            name="isDone"
            id={event.id}
            checked={event.isDone}
            // what's the difference between onClick and onChange?
            onClick={(e) => e.stopPropagation()}
            onChange={handleToggle}
          />
        )}
        <span>{event.isDone ? <s>{event.name}</s> : event.name}</span>
      </button>
    </>
  );
};
