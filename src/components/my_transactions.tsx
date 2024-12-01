import { FunctionComponent } from "react";
import { ShopTransaction } from "../sqlite.server";
import { useFetcher } from "@remix-run/react";
import { action as shopCancelAction } from "../routes/shop.cancel";

type MyTransactionsProps = {
  transactions: ShopTransaction[];
};

export const MyTransactions: FunctionComponent<MyTransactionsProps> = ({ transactions }) => {
  const fetcher = useFetcher<typeof shopCancelAction>();
  return (
    <div>
      <h1>My Transactions</h1>
      {fetcher.data && !fetcher.data["success"] && <p>{fetcher.data["message"]}</p>}
      <ul>
        {transactions.map(transaction => (
          <li key={transaction.id}>
            {transaction.transaction_time}
            {" "}
            {transaction.shop_item_id}
            {" "}
            -
            {" "}
            {transaction.user_id}

            {!transaction.cancelled_at ? "Valid" : "Invalid"}
            <fetcher.Form method="post" action="shop/cancel">
              <input type="hidden" name="transaction_id" value={transaction.id} />
              <button type="submit">X</button>
            </fetcher.Form>
          </li>
        ))}
      </ul>
    </div>
  );
};
