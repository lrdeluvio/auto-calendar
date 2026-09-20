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

    const isEventPastCurrDateTime = Temporal.PlainDateTime.compare(currentDateTime, start) <= 0;
    const isCurrDateTimeInEvent =
      Temporal.PlainDateTime.compare(currentDateTime, start) >= 0 &&
      Temporal.PlainDateTime.compare(currentDateTime, end) <= 0;

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

  const isDue =
    Temporal.PlainDate.compare(Temporal.PlainDate.from(event.start), Temporal.PlainDate.from(event.dueDate)) === 0;
  // An entry is considered almost due if it is sorted 33.33% near its dueDate.
  const isAlmostDue = Temporal.PlainDate.from(event.dueDate).subtract({
    days: Math.round(
      Temporal.PlainDate.from(event.dueDate).since(Temporal.PlainDate.from(event.startDate), { largestUnit: "days" })
        .days / 3,
    ),
  });

  return (
    <>
      <button
        style={{ backgroundColor: event.color, width: "100%", height: "100%" }}
        onClick={() => NiceModal.show(EditEntryModal, { entry: event })}
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
            style={
              !event.isDone && isDue
                ? { outline: "2px solid red" }
                : !event.isDone && Temporal.PlainDate.compare(Temporal.PlainDate.from(event.start), isAlmostDue) >= 0
                  ? { outline: "2px dotted orange" }
                  : {}
            }
          />
        )}
        <span>
          {event.isDone ? <s>{event.name}</s> : event.name}

          {event.notes && (
            <span className="material-symbols-outlined" style={{ verticalAlign: "middle" }}>
              sticky_note_2
            </span>
          )}
        </span>
      </button>
    </>
  );
};
