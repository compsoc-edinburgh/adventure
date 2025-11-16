import { FaStar } from "react-icons/fa";
import NumberFlow from "@number-flow/react";

const Stars = ({ amount, prefix, className }: { amount: number; prefix?: string; className?: string }) => (
  <span className={`flex items-center text-lg font-display gap-1 ${className}`}>
    <span className="text-xl">
      {prefix}
      {" "}
      <NumberFlow value={amount} />
    </span>
    <FaStar />
  </span>
);

export default Stars;
