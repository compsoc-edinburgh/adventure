import { LoaderFunctionArgs } from "@remix-run/node";
import UserLogin from "../components/UserLogin";
import { getSession } from "../sessions";
import { useLoaderData } from "@remix-run/react";
import { Shop } from "../components/Shop";
import { MyTransactions } from "../components/MyTransactions";
import { getShopItems, getTransactionsByUserId, getUserById, ShopItem, ShopTransaction, updateUserStars, User } from "../sqlite.server";
import SnowParticles from "../components/Particles";
import { getStarsForUser } from "../stars.server";
import { Tree } from "../components/Tree";
import { Ornament1 } from "../components/Ornament1";
import { CompSocLogo } from "../components/CompSocLogo";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );

  const response: { user: User | undefined; remaining_stars: number; shop_items: ShopItem[]; transactions: ShopTransaction[] } = {
    user: undefined,
    remaining_stars: 0,
    shop_items: [],
    transactions: [],
  };

  response.shop_items = getShopItems();

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
    <div className="w-full">
      <div className="absolute inset-0 top-0 left-0 overflow-hidden -z-10">
        <Tree className="absolute h-full -left-12" />
      </div>
      <div className="flex flex-col mt-8 mb-8 items-center">
        <CompSocLogo className="w-32 opacity-50 mb-4" />
        <h1 className="md:text-7xl text-4xl text-center font-display bg-clip-text text-transparent bg-gradient-to-t from-christmasDark to-christmasRed">Advent of Code Rewards</h1>
        <Ornament1 className="w-56 -mt-3" />
      </div>

      <div className="flex md:flex-row flex-col">
        <div className="md:block hidden flex-grow" />
        <div className="flex flex-col">
          <UserLogin user={user} />
          <Shop shop_items={shop_items} />
        </div>
        <MyTransactions user={user} remaining_stars={remaining_stars} shop_items={shop_items} transactions={transactions} />
        <div className="md:block hidden w-16" />
      </div>
      <SnowParticles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color="#ffffff"
        size={3}
        staticity={60}
        vy={1.1}
      />
    </div>
  );
}
