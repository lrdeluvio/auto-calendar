import { deleteEntry} from "../db/queries/entries";

interface DeleteEntryButtonProps {
  entryId: string;
  onOk?: () => void;
  onError?: (error: string) => void;
}

export const DeleteEntryButton = ({
  entryId,
  onOk,
  onError,
}: DeleteEntryButtonProps) => {
  const handleClick = async () => {
    const isDelete = confirm("Delete item?");
    if (!isDelete) return;

    const result = await deleteEntry(entryId);
    if (result.ok) onOk && onOk();
    else onError && onError(result.error);
  };
  return (
    <>
      <button type="button" onClick={handleClick}>
        Delete
      </button>
    </>
  );
};
