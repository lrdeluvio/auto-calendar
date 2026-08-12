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
  id = useId(),
  ...selectProps
}: FormSelectProps) => {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <select name={name} id={id} {...selectProps}>
        {options.map((opt) => (
          <option value={opt.value} key={opt.id ?? opt.value} selected={defaultSelected === opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </>
  );
};
