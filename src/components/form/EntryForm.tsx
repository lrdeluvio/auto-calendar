import type { ReactNode } from "react";
import type { EntryDbModel } from "../../db/types";

type EntryFormProps = {
  onOk?: () => void;
  onError?: (e: any) => void;
  children?: ReactNode;
} & (
  | {
      mode: "create";
      data?: undefined;
      createFormAction: (formData: FormData) => void;
    }
  | {
      mode: "edit" | "view";
      data: EntryDbModel;
      updateFormAction: (formData: FormData, entry: EntryDbModel) => void;
    }
);

export const EntryForm = (props: EntryFormProps) => {
  const { mode, data, onOk, onError, children } = props;
  const isViewOnly = mode === "view";

  const handleFormAction = (formData: FormData) => {
    try {
      mode === "create"
        ? props.createFormAction(formData)
        : mode === "edit" && data
          ? props.updateFormAction(formData, data)
          : undefined;

      onOk && onOk();
    } catch (e) {
      onError && onError(e);
    }
  };

  return (
    <form
      action={handleFormAction}
      style={{ display: "flex", flexDirection: "column" }}
    >
      {children}

      {!isViewOnly && (
        <button type="submit">{mode === "create" ? "Create" : "Update"}</button>
      )}
    </form>
  );
};

      