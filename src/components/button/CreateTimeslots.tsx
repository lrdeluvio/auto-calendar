import NiceModal from "@ebay/nice-modal-react";
import { CreateTimeslotModal } from "../modals/CreateTimeslotModal";

export const CreateTimeslotButton = () => {
  return (
    <>
      <button onClick={() => NiceModal.show(CreateTimeslotModal)}>Create new time slot</button>
    </>
  );
};
