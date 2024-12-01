import { FaStar } from "react-icons/fa";

const Stars = ({ amount, className }: { amount: number; className?: string }) => (
  <span className={`flex items-center text-lg font-display gap-1 text-christmasRedAccent ${className}`}>
    {amount}
    <FaStar />
  </span>
);

export default Stars;
