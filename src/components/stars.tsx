import { FaStar } from "react-icons/fa";

const Stars = ({ amount }: { amount: number }) => (
  <span className="flex items-center text-lg font-display gap-1 text-christmasRedAccent">
    <FaStar />
    {amount}
  </span>
);

export default Stars;
