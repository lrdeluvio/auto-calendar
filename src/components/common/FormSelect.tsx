import { useId } from "react";

type FormSelectProps = {
  label: string;
  name: string;
  id?: string;
  defaultSelected?: string | number | undefined;
  options: {
    id?: string;
    value: string | number | undefined;
    label: string;
  }[];
} & React.InputHTMLAttributes<HTMLSelectElement>;

export const FormSelect = ({
  label,
  name,
  defaultSelected,
  options,
  id,
  ...selectProps
}: FormSelectProps) => {
  const randomId = useId();
  const inputId = id ?? randomId;
  
  return (
    <>
      <label htmlFor={inputId}>{label}</label>
      <select name={name} id={inputId} {...selectProps}>
        {options.map((opt) => (
          <option value={opt.value} key={opt.id ?? opt.value} selected={defaultSelected === opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </>
  );
};
