import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { Modal } from "../common/Modal";
import type { CalendarEntryType } from "../../types/models/CalendarEntry";
import { useState } from "react";
import { EntryForm } from "../form/EntryForm";
import { EntryFormFields } from "../form/EntryFormFields";
import { createEventFromForm } from "../form/eventFromForm";
import { createTaskFromForm } from "../form/taskFromForm";
import type { EntryDbModel } from "../../db/types";

export const CreateEntryModal = NiceModal.create(({ entry }: { entry?: EntryDbModel }) => {
  const modal = useModal();
  const [itemType, setItemType] = useState<CalendarEntryType>(entry?.type ?? "event");

  return (
    <Modal>
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
        onChange={(e) => setItemType(e.target.value as CalendarEntryType)}
        required
      />

      <EntryForm
        mode="create"
        action={(formData) =>
          itemType === "task" ? createTaskFromForm(formData) : createEventFromForm(formData)
        }
        onOk={() => modal.remove()}
      >
        <EntryFormFields isViewOnly={false} itemType={itemType === "task" ? "task" : "event"} {...(entry ? { data: entry } : {})} />
      </EntryForm>

      <button onClick={() => modal.hide()}>Close</button>
    </Modal>
  );
});
