import { FunctionComponent } from "react";
import { ShopTransaction } from "../sqlite.server";

type MyTransactionsProps = {
  transactions: ShopTransaction[];
};

export const MyTransactions: FunctionComponent<MyTransactionsProps> = ({ transactions }) => {
  return (
    <div>
      <h1>My Transactions</h1>
      <ul>
        {transactions.map(transaction => (
          <li key={transaction.id}>
            {transaction.shop_item_id}
            {" "}
            -
            {" "}
            {transaction.user_id}
          </li>
        ))}
      </ul>
    </div>
  );
};
