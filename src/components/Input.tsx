import { FunctionComponent } from "react";

type InputProps = {
  type?: string;
  label: string;
  placeholder: string;
  name: string;
  value?: string;
  // eslint-disable-next-line no-unused-vars
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Input: FunctionComponent<InputProps> = ({ type, label, placeholder, name, value, onChange }) => {
  return (
    <div>
      <label htmlFor={name} className="block mb-2 text-sm text-christmasDark">{label}</label>
      <input type={type ?? "text"} name={name} placeholder={placeholder} required className="bg-gray-50 border border-christmasBeigeAccent  text-sm rounded-lg focus:outline-double focus:outline-4 focus:outline-christmasRed box-border block w-72 p-3" value={value ?? ""} onChange={onChange ?? undefined} />
    </div>
  );
};

export default Input;
