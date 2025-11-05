import React, { FunctionComponent } from "react";
import { User, ShopItem, ShopTransaction } from "../sqlite.server";
import { useFetcher } from "react-router";
import { action as shopCancelAction } from "../routes/shop.cancel";
import Stars from "./Stars";
import { IoMdCloseCircle } from "react-icons/io";
import { cutoffTime } from "../cutoff";

type MyTransactionsProps = {
  user?: User;
  remaining_stars: number;
  shop_items: ShopItem[];
  transactions: ShopTransaction[];
  className?: string;
};

export const MyTransactions: FunctionComponent<MyTransactionsProps> = ({ user, remaining_stars, shop_items, transactions, className }) => {
  const fetcher = useFetcher<typeof shopCancelAction>();

  const isPostCutoff = new Date().getTime() > cutoffTime.getTime();

  return (
    <div className={"lg:self-start self-stretch flex flex-col mx-4 shadow-christmasBeigeAccent group " + className}>
      <h2 className="text-4xl font-display mb-4 relative self-start text-white">
        <div className="w-full bg-christmasDark bg-opacity-80 backdrop-blur-md h-full absolute top-0 left-0 z-[-1] scale-110 -skew-x-12 -rotate-2 transform-gpu" />
        My Purchases
      </h2>
      <div className="bg-white shadow-sm min-w-96 lg:max-w-md rounded-lg">
        <div className="p-6">
          <span className="text-sm opacity-50">
            Purchases
            {user && ` for AoC#${user.aoc_id}`}
          </span>
          <h1 className="text-3xl font-display mb-4">Dear Santa, I want...</h1>
          {fetcher.data && !fetcher.data["success"] && <p>{fetcher.data["message"]}</p>}
          {transactions.filter(t => !t.cancelled_at).length === 0 && (
            <p className="opacity-50">...Nothing! That's fine too.</p>
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

                      {!isPostCutoff && (
                        <fetcher.Form method="post" action="shop/cancel" className="opacity-0 group-hover:opacity-100 transition-all duration-75 absolute top-1/2 -translate-y-1/2 -right-4 group-hover:-right-5 flex items-center text-lg">
                          <input type="hidden" name="transaction_id" value={transaction.id} />
                          <button type="submit" title="Remove this item">
                            <IoMdCloseCircle />
                          </button>
                        </fetcher.Form>
                      )}
                    </div>
                  </li>
                )}
              </React.Fragment>
            ))}
          </ul>

          {isPostCutoff && (
            <p className="text-sm mt-4 opacity-50">
              The shop has closed as of
              {" "}
              {cutoffTime.toLocaleDateString([], {
                timeZone: "Europe/London",
              },
              )}
              {" "}
              {cutoffTime.toLocaleTimeString([], {
                hour: "2-digit", minute: "2-digit",
                timeZone: "Europe/London",
              })}
              {" "}
              UK time.
              Your purchase list cannot be modified. Please await further announcement via your registered email or Discord for your reward collection!
            </p>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg group min-w-64 lg:max-w-md border-t-2 border-christmasGreenAccent">
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

      {user
      && (
        <div className="bg-white transition-all opacity-80 lg:opacity-0 group-hover:opacity-75 -mt-1 group-hover:mt-0 shadow-sm rounded-lg group min-w-64 lg:max-w-md border-t-2 border-christmasGreenAccent">
          <div className="px-6 pt-3">
            <div className="pb-3">
              <p><b>{transactions.filter(t => !t.cancelled_at).length > 0 ? "That's It!" : "Collection"}</b></p>
              <p className="text-sm">Once you've chosen your rewards and they are listed above, you're good to go. Once January comes around, you'll be able to collect these physically.</p>
            </div>
            {user.gained_stars === 0 && (
              <div className="pb-3">
                <p><b>Start Collecting!</b></p>
                <p className="text-sm">
                  You can start collecting stars by solving programming questions on Advent of Code! They will show up here if you've used the correct AoC ID to log in.
                  <br />
                  <a href="https://adventofcode.com" className="text-blue-500">https://adventofcode.com</a>
                </p>
              </div>
            )}
            {user.gained_stars > 0 && (
              <div className="pb-3">
                <p><b>Don't know what to get?</b></p>
                <p className="text-sm">
                  Once you have exchanged your stars for a reward token, it'll be reserved for you. But you can also cancel it from this page to let someone else have it.
                </p>
              </div>
            )}
            <div className="pb-3">
              <p><b>Star count incorrect?</b></p>
              <p className="text-sm">
                Due to Advent of Code API limitations, we only sync your stars every 15 minutes. If you've just solved a puzzle, it may take a while to show up here.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
