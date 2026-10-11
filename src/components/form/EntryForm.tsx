import type { ReactNode } from "react";
import type { EntryDbModel } from "../../db/types";
import type { Result } from "../../types/common";

type EntryFormProps = {
  onOk?: () => void;
  onError?: (e: unknown) => void;
  children: ReactNode;
} & (
  | {
      mode: "create";
      action: (formData: FormData) => Promise<Result<string, string>>;
    }
  | {
      mode: "edit";
      data: EntryDbModel;
      action: (formData: FormData, entry: EntryDbModel) => Promise<Result<string, string>>;
    }
);

export const EntryForm = (props: EntryFormProps) => {
  const { mode, onOk, onError, children, action } = props;
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const result =
      mode === "create"
        ? await action(formData)
        : await action(formData, props.data);

    if (!result.ok) {
      onError?.(result.error);
      return;
    }
     onOk?.();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }} key={crypto.randomUUID()}>
      {children}
      <button type="submit">{mode === "create" ? "Create" : "Update"}</button>
    </form>
  );
};
