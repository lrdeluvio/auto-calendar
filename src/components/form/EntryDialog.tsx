import {
  useState,
  createContext,
  useRef,
  type ReactNode,
  useContext,
  useEffect,
} from "react";
import type { EntryDbModel } from "../../db/types";

interface EntryDialogProps {
  children?: ReactNode;
}
interface EntryDialogContextType {
  isOpen: boolean;
  entry: EntryDbModel | null;
  openDialog: (data: EntryDbModel) => void;
  closeDialog: () => void;
}

export const EntryDialogContext = createContext<EntryDialogContextType | null>(null);

export const EntryDialogProvider = ({ children }: EntryDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [entry, setEntry] = useState<EntryDbModel | null>(null);

  const openDialog = (entry: EntryDbModel) => {
    setEntry(entry);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setEntry(null);
    setIsOpen(false);
  };

  return (
    <EntryDialogContext value={{ isOpen, entry, openDialog, closeDialog }}>
      {children}
    </EntryDialogContext>
  );
};

export const useEntryDialog = () => {
  const context = useContext(EntryDialogContext);
  if (!context) throw new Error("context must be inside a DialogProvider");
  return context;
};

export const EntryDialog = ({ children }: EntryDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { isOpen, closeDialog } = useEntryDialog();

  useEffect(() => {
    const dialogEl = dialogRef.current;
    if (!dialogEl) return;

    if (isOpen) dialogEl.showModal();
    else dialogEl.close();
  }, [isOpen]);

  return (
    <EntryDialogProvider>
      <dialog ref={dialogRef} onClose={closeDialog}>{children}</dialog>
    </EntryDialogProvider>
  );
};
