import { FaStar } from "react-icons/fa";

const Stars = ({ amount, className }: { amount: number; className?: string }) => (
  <span className={`flex items-center text-lg font-display gap-1 ${className}`}>
    <span className="text-xl">{amount}</span>
    <FaStar />
  </span>
);

export default Stars;
