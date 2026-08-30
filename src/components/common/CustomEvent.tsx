import NiceModal from "@ebay/nice-modal-react";
import { db } from "../../db/db";
import type { EntryDbModel } from "../../db/types";
import { sortTasks } from "../../utils/sortTasks";
import { EditEntryModal } from "../modals/EditEntryModal";

export const CustomEvent = ({ event }: { event: EntryDbModel }) => {
  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const currentDateTime = Temporal.Now.plainDateTimeISO().round("minute");
    const isEventAftercurrentDateTime =
      Temporal.PlainDateTime.compare(Temporal.PlainDateTime.from(event.start), currentDateTime) <= 0;

    try {
      await db.events.update(event.id, {
        isDone: e.target.checked,
        ...(isEventAftercurrentDateTime
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
        style={{ backgroundColor: "red", width: "100%", height: "100%" }}
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
