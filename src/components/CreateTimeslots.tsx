import { useRef } from "react";
import { addTimeSlot } from "../db/queries/slots";


const createTimeslotFromForm = async (data: FormData) => {
  const slot = {
    name: String(data.get("name")),
    start: Temporal.PlainTime.from(String(data.get("start"))),
    end: Temporal.PlainTime.from(String(data.get("end"))),
  };

  const x = await addTimeSlot(slot);

  if (!x.ok) alert(x.error);
};

export const CreateTimeslotButton = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const toggleDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.togglePopover();
    }
  };

  return (
    <>
      <dialog ref={dialogRef} popover="manual">
        <p>this popped?</p>
        <form action={createTimeslotFromForm}>
          <label htmlFor="name">Name</label>
          <input type="text" name="name" id="name" required />

          <label htmlFor="start">start</label>
          <input
            type="time"
            name="start"
            id="start"
            min="0"
            max="1440"
            required
          />

          <label htmlFor="end">end</label>
          <input type="time" name="end" id="end" min="0" max="1440" required />

          <button type="submit">Create</button>
        </form>
        <button onClick={toggleDialog}>Close</button>
      </dialog>
      <button onClick={toggleDialog}>Create new time slot</button>
    </>
  );
};
