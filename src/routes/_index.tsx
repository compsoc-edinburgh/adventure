import { LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "../sessions";
import { useLoaderData } from "@remix-run/react";
import { Shop } from "../components/Shop";
import { MyTransactions } from "../components/MyTransactions";
import { getTransactionsByUserId, getUserById, ShopItemWithRemaining, ShopTransaction, updateUserStars, User } from "../sqlite.server";
import { getStarsForUser } from "../stars.server";
import { loader as shopItemWithRemainingLoader } from "./shop.items";

export async function loader(args: LoaderFunctionArgs) {
  const { request } = args;

  const session = await getSession(
    request.headers.get("Cookie"),
  );

  const response: { user: User | undefined; remaining_stars: number; shop_items: ShopItemWithRemaining[]; transactions: ShopTransaction[] } = {
    user: undefined,
    remaining_stars: 0,
    shop_items: [],
    transactions: [],
  };

  // Call the loader for the public shop API, which has the remaining stock count
  response.shop_items = await shopItemWithRemainingLoader(args);

  if (session.has("user_id")) {
    const user_id = session.get("user_id");
    if (user_id) {
      response.user = getUserById(parseInt(user_id));
      response.transactions = getTransactionsByUserId(response.user.id);

      const gained_stars = response.user.aoc_id && getStarsForUser(response.user.aoc_id);
      if (response.user.gained_stars !== gained_stars && gained_stars) {
        updateUserStars(parseInt(user_id), gained_stars);
        response.user = getUserById(parseInt(user_id));
      }

      response.remaining_stars = response.user.gained_stars - response.transactions.reduce((acc, t) => {
        const item = response.shop_items.find(i => i.id === t.shop_item_id);
        if (!item || t.cancelled_at) {
          return acc;
        }
        return acc + item.star_cost;
      }, 0);
    }
  }

  return response;
}

export default function Index() {
  const { user, remaining_stars, shop_items, transactions } = useLoaderData<typeof loader>();

  return (
    <div className="flex lg:flex-row flex-col-reverse gap-4">
      <div className="md:block lg:w-96 md:w-16 hidden flex-grow" />
      <Shop shop_items={shop_items} />
      <MyTransactions user={user} remaining_stars={remaining_stars} shop_items={shop_items} transactions={transactions} />
      <div className="md:block hidden w-16" />
    </div>
  );
}
