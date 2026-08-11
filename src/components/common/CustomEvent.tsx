import { db } from "../../db/db";
import type { EventDbModel } from "../../db/types";
import { sortTasks } from "../../utils/sortTasks";
import { useCalItemDialog } from "../form/CalItemDialog";

export const CustomEvent = ({ event }: { event: EventDbModel }) => {
  const handleToggle = async (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const currentTime = Temporal.Now.plainDateTimeISO();
    const isEventAfterCurrentTime =
      Temporal.PlainDateTime.compare(event.start, currentTime) === 1;

    try {
      await db.events.update(event.id, {
        isDone: e.target.checked,
        ...(isEventAfterCurrentTime
          ? {
              end: currentTime.toString(),
              start: currentTime.subtract(event.duration).toString(),
            }
          : {}),
      });
      await sortTasks();
    } catch (e) {
      console.warn(e);
    }
  };
  // useEntryDialogView()
  const {openDialog} = useCalItemDialog()

  return (
    <>
      <button
        style={{ backgroundColor: "red", width: "100%", height: "100%" }}
        onClick={() => openDialog(event)}
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
