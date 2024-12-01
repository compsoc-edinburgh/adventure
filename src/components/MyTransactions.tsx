import React, { FunctionComponent } from "react";
import { User, ShopItem, ShopTransaction } from "../sqlite.server";
import { useFetcher } from "@remix-run/react";
import { action as shopCancelAction } from "../routes/shop.cancel";
import Stars from "./Stars";

type MyTransactionsProps = {
  user?: User;
  remaining_stars: number;
  shop_items: ShopItem[];
  transactions: ShopTransaction[];
};

export const MyTransactions: FunctionComponent<MyTransactionsProps> = ({ user, remaining_stars, shop_items, transactions }) => {
  const fetcher = useFetcher<typeof shopCancelAction>();
  return (
    <div className="md:self-start self-stretch mx-4 shadow-christmasBeigeAccent">
      <div className="bg-white shadow-sm min-w-64 max-w-md rounded-lg">
        <div className="p-6">
          <h1 className="text-3xl font-display mb-4">Santa, I would like...</h1>
          {fetcher.data && !fetcher.data["success"] && <p>{fetcher.data["message"]}</p>}
          {transactions.filter(t => !t.cancelled_at).length === 0 && (
            <p className="opacity-50">Nothing. That's fine too.</p>
          )}
          <ul>
            {transactions.map(transaction => (
              <React.Fragment key={transaction.id}>
                {!transaction.cancelled_at && (
                  <li>
                    <div className="flex flex-row items-center justify-between font-semibold relative before:top-1/2 before:absolute before:w-full before:h-1 before:border-t-2 before:border-christmasDark before:border-opacity-75 before:border-dotted">
                      <span className="z-10 bg-white">
                        {shop_items.find(i => i.id === transaction.shop_item_id)?.name}
                      </span>
                      <Stars className="z-10 bg-white pl-2" amount={shop_items.find(i => i.id === transaction.shop_item_id)?.star_cost || 0} />
                    </div>

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
      </div>

      <div className="bg-white shadow-sm rounded-lg group min-w-64 border-t-2 border-christmasGreenAccent">
        <div className="px-6 pb-3 pt-3">
          {user && (
            <div className="flex flex-row justify-between">
              <span>AoC Stars Collected</span>
              <Stars amount={user.gained_stars} />
            </div>
          )}
          {user && (
            <div className="flex flex-row justify-between">
              <span>Stars Spent</span>
              <Stars amount={-1 * transactions.reduce((acc, t) => {
                const item = shop_items.find(i => i.id === t.shop_item_id);
                if (!item || t.cancelled_at) {
                  return acc;
                }
                return acc + item.star_cost;
              }, 0)}
              />
            </div>
          )}
          <div className="flex flex-row justify-between font-bold">
            <span>Available to Spend</span>
            <Stars amount={remaining_stars} />
          </div>
          {!user && (
            <div>
              <p className="opacity-50">Log in to view your stars.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
