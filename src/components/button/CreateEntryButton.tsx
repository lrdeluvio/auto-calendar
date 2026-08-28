import NiceModal from "@ebay/nice-modal-react";
import { CreateEntryModal } from "../modals/CreateEntryModal";

export const CreateEntryButton = () => {
  return <button onClick={() => NiceModal.show(CreateEntryModal)}>Create new calendar-item</button>;
};
