import React, { FunctionComponent } from "react";
import { ShopItem, ShopTransaction } from "../sqlite.server";
import { useFetcher } from "@remix-run/react";
import { action as shopCancelAction } from "../routes/shop.cancel";

type MyTransactionsProps = {
  remaining_stars: number;
  shop_items: ShopItem[];
  transactions: ShopTransaction[];
};

export const MyTransactions: FunctionComponent<MyTransactionsProps> = ({ remaining_stars, shop_items, transactions }) => {
  const fetcher = useFetcher<typeof shopCancelAction>();
  return (
    <div className="bg-white mx-4 rounded-md group min-w-64">
      <div className="px-6 pt-6 pb-3">
        <h1 className="text-3xl font-display mb-4">I want...</h1>
        {fetcher.data && !fetcher.data["success"] && <p>{fetcher.data["message"]}</p>}
        <ul>
          {transactions.map(transaction => (
            <React.Fragment key={transaction.id}>
              {!transaction.cancelled_at && (
                <li>
                  <span className="block font-semibold">
                    {shop_items.find(i => i.id === transaction.shop_item_id)?.name}
                  </span>
                  <span className="flex flex-row justifybetween">
                    <span>
                      {transaction.transaction_time}
                    </span>
                    <span>
                      ⭐
                      {" "}
                      {shop_items.find(i => i.id === transaction.shop_item_id)?.star_cost}
                    </span>
                  </span>

                  <fetcher.Form method="post" action="shop/cancel">
                    <input type="hidden" name="transaction_id" value={transaction.id} />
                    <button type="submit">X</button>
                  </fetcher.Form>
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
      <div className="w-full border-t-4 border-dotted border-christmasGreen" />
      <div className="px-6 pb-6 pt-3 flex flex-row justify-between">
        <span className="capitalize">Remaining</span>
        <span>
          ⭐
          {remaining_stars}
        </span>
      </div>
    </div>
  );
};
