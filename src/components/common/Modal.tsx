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
    <dialog ref={dialogRef} onCancel={() => modal.hide()} onClick={() => modal.hide()} style={{ padding: "0" }}>
      <div style={{ padding: "1em" }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </dialog>
  );
};
