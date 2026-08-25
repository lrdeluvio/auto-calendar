import { useModal } from "@ebay/nice-modal-react";
import { useRef, useEffect, type ReactNode } from "react";

export const Modal = ({ children }: { children: ReactNode }) => {
  const modal = useModal();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (modal.visible) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [modal.visible]);

  return (
    <dialog ref={dialogRef} onClose={() => modal.hide().then(() => modal.remove())}>
      {children}
    </dialog>
  );
};
