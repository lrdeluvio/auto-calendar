import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { CustomEvent } from "../components/common/CustomEvent";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { Modal } from "./common/Modal";

export const UnsortedTaskModal = NiceModal.create(() => {
  const modal = useModal();
  const items = useLiveQuery(() => db.events.filter((i) => i.isSortable && !i.isSorted).toArray());
  return (
    <Modal>
      <ul style={{listStyleType: "none"}}>
        {items
          ? items.map((i) => (
              <li> 
                <CustomEvent event={i} />
              </li>
            ))
          : undefined}
      </ul>
      <button onClick={() => modal.hide()}>Close</button>
    </Modal>
  );
});

export const ViewUnsortedTasksButton = () => {
  return (
    <>
      <button onClick={() => NiceModal.show(UnsortedTaskModal)}>
        View Unsorted Tasks
      </button>
    </>
  );
};
