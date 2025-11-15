import { FaStar } from "react-icons/fa";

const Stars = ({ amount, prefix, className }: { amount: number; prefix?: string; className?: string }) => (
  <span className={`flex items-center text-lg font-display gap-1 ${className}`}>
    <span className="text-xl">
      {prefix}
      {" "}
      {amount}
    </span>
    <FaStar />
  </span>
);

export default Stars;
