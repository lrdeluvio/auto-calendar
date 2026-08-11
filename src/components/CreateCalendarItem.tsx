import { useEffect, useState } from "react";
import type { CalendarEntryType } from "../types/models/CalendarEntry";
import { EntryForm } from "./form/EntryForm";
import { EntryFormFields,  } from "./form/EntryFormFields";
import { createEventFromForm } from "./form/eventFromForm";
import { createTaskFromForm } from "./form/taskFromForm";

interface CreateEntryButtonProp {
  defaultItemType: CalendarEntryType;
}

export const CreateEntryButton = ({
  defaultItemType,
}: CreateEntryButtonProp) => {
  const [itemType, setItemType] = useState<CalendarEntryType>(defaultItemType);
  useEffect(() => console.log(itemType), [itemType]);
  return (
    <>
      <dialog id="create-calendar-item-dialog" popover="">
        <label htmlFor="item-type-event">Event</label>
        <input
          type="radio"
          name="item-type"
          id="item-type-event"
          value={"event"}
          checked={itemType === "event"}
          onChange={(e) => setItemType(e.target.value as CalendarEntryType)}
          required
        />

        <label htmlFor="item-type-task">Task</label>
        <input
          type="radio"
          name="item-type"
          id="item-type-task"
          value={"task"}
          checked={itemType === "task"}
          onChange={(e) => setItemType(e.target.value as "event" | "task")}
          required
        />

        {itemType === "task" ? (
          <EntryForm
            mode="create"
            createFormAction={(formData) => createTaskFromForm(formData)}
          >
            <EntryFormFields isViewOnly={false} itemType={"task"} />
          </EntryForm>
        ) : (
          <EntryForm
            mode="create"
            createFormAction={(formData) => createEventFromForm(formData)}
          >
            <EntryFormFields isViewOnly={false} itemType={"event"} />
          </EntryForm>
        )}

        <button
          popoverTarget="create-calendar-item-dialog"
          popoverTargetAction="hide"
        >
          Close
        </button>
      </dialog>

      <button
        popoverTarget="create-calendar-item-dialog"
        popoverTargetAction="show"
      >
        Create new calendar-item
      </button>
    </>
  );
};
