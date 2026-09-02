import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { Modal } from "../common/Modal";
import { EntryForm } from "../form/EntryForm";
import { EntryFormFields } from "../form/EntryFormFields";
import { updateTaskFromForm } from "../form/taskFromForm";
import type { EntryDbModel } from "../../db/types";
import { DeleteEntryButton } from "../DeleteEntryButton";
import { CreateEntryModal } from "./CreateEntryModal";

export const EditEntryModal = NiceModal.create(({ entry }: { entry: EntryDbModel }) => {
  const modal = useModal();
  return (
    <Modal>
      <EntryForm
        mode="edit"
        data={entry}
        updateFormAction={(formData, entry) => updateTaskFromForm(formData, entry.id)}
        onOk={() => modal.remove()}
      >
        <EntryFormFields isViewOnly={false} itemType={entry.type} data={entry} />
      </EntryForm>
      <button onClick={() => modal.hide()}>Close</button>{" "}
      <button
        onClick={() => {
          modal.remove();
          NiceModal.show(CreateEntryModal, { entry: entry });
        }}
      >
        Duplicate
      </button>
      <DeleteEntryButton entryId={entry.id} onOk={() => modal.remove()} />
    </Modal>
  );
});
