import { useId } from "react";

type FormInputProps = {
  label: string;
  id?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const FormInput = ({ label, id, ...props }: FormInputProps) => {
  const randomId = useId();
  const inputId = id ?? randomId;

  return (
    <>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} {...props} />
    </>
  );
};
