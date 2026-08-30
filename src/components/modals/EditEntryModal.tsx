import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { Modal } from "../common/Modal";
import type { CalendarEntryType } from "../../types/models/CalendarEntry";
import { useState } from "react";
import { EntryForm } from "../form/EntryForm";
import { EntryFormFields } from "../form/EntryFormFields";
import { createEventFromForm } from "../form/eventFromForm";
import { createTaskFromForm, updateTaskFromForm } from "../form/taskFromForm";
import type { EntryDbModel } from "../../db/types";

export const EditEntryModal = NiceModal.create(({entry}: {entry: EntryDbModel}) => {
  const modal = useModal();
  return (
    <Modal>

        <EntryForm
          mode="edit"
          data={entry}
          updateFormAction={(formData, entry) => updateTaskFromForm(formData, entry.id)}
          onOk={() => modal.remove()}
        >
          <EntryFormFields isViewOnly={false} itemType={"task"} data={entry} />
        </EntryForm>
      <button onClick={() => modal.hide()}>Close</button>
    </Modal>
  );
});

