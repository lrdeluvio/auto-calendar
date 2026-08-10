import {
  useState,
  createContext,
  useRef,
  type ReactNode,
  useContext,
  useEffect,
} from "react";
import type { EventDbModel } from "../../db/types";

interface CalItemDialogProps {
  children?: ReactNode;
}
interface CalItemDialogContextType {
  isOpen: boolean;
  calItem: EventDbModel | null;
  openDialog: (data: EventDbModel) => void;
  closeDialog: () => void;
}

export const CalItemDialogContext = createContext<CalItemDialogContextType | null>(null);

export const CalItemDialogProvider = ({ children }: CalItemDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [calItem, setCalItem] = useState<EventDbModel | null>(null);

  const openDialog = (calItem: EventDbModel) => {
    setCalItem(calItem);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setCalItem(null);
    setIsOpen(false);
  };

  return (
    <CalItemDialogContext value={{ isOpen, calItem, openDialog, closeDialog }}>
      {children}
    </CalItemDialogContext>
  );
};

export const useCalItemDialog = () => {
  const context = useContext(CalItemDialogContext);
  if (!context) throw new Error("context must be inside a DialogProvider");
  return context;
};

export const CalItemDialog = ({ children }: CalItemDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { isOpen, closeDialog } = useCalItemDialog();

  useEffect(() => {
    const dialogEl = dialogRef.current;
    if (!dialogEl) return;

    if (isOpen) dialogEl.showModal();
    else dialogEl.close();
  }, [isOpen]);

  return (
    <CalItemDialogProvider>
      <dialog ref={dialogRef} onClose={closeDialog}>{children}</dialog>
    </CalItemDialogProvider>
  );
};
