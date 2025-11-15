import { FunctionComponent } from "react";

interface InputProps {
  type?: string;
  label: string;
  placeholder: string;
  name: string;
  value?: string;
  required?: boolean;
  defaultValue?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  // eslint-disable-next-line no-unused-vars
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: FunctionComponent<InputProps> = ({ type, label, placeholder, name, value, required, defaultValue, onChange, inputProps, ...props }) => {
  return (
    <div {...props}>
      <label htmlFor={name} className="block mb-2 text-sm text-christmasDark">{label}</label>
      <input type={type ?? "text"} name={name} placeholder={placeholder} required={required} className="bg-gray-50 border border-christmasBeigeAccent  text-sm rounded-lg focus:outline-double focus:outline-4 focus:outline-christmasRed box-border block w-72 p-3" value={value} onChange={onChange} defaultValue={defaultValue} {...inputProps} />
    </div>
  );
};

export default Input;
