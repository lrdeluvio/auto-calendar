import type { ReactNode } from "react";
import type { EntryDbModel } from "../../db/types";
import type { Result } from "../../types/common";

type EntryFormProps = {
  onOk?: () => void;
  onError?: (e: any) => void;
  children: ReactNode;
} & (
  | {
      mode: "create";
      createFormAction: (formData: FormData) => Promise<Result<string, string>>;
    }
  | {
      mode: "edit";
      data: EntryDbModel;
      updateFormAction: (formData: FormData, entry: EntryDbModel) => Promise<Result<string, string>>;
    }
);

export const EntryForm = (props: EntryFormProps) => {
  const { mode, onOk, onError, children } = props;
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result =
      mode === "create" ? await props.createFormAction(formData) : await props.updateFormAction(formData, props.data);

    if (!result.ok) {
      onError && onError(result.error);
      return;
    } else onOk && onOk();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
      {children}
      <button type="submit">{mode === "create" ? "Create" : "Update"}</button>
    </form>
  );
};
