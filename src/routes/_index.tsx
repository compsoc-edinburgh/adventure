import { LoaderFunctionArgs } from "@remix-run/node";
import UserLogin from "../components/user_login";
import { getSession } from "../sessions";
import { useLoaderData } from "@remix-run/react";
import { Shop } from "../components/shop";
import { MyTransactions } from "../components/my_transactions";
import { getShopItems, getTransactionsByUserId, getUserById, ShopItem, ShopTransaction, updateUserStars, User } from "../sqlite.server";
import SnowParticles from "../components/snow";
import { getStarsForUser } from "../stars.server";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );

  const response: { user: User | undefined; shop_items: ShopItem[]; transactions: ShopTransaction[] } = {
    user: undefined,
    shop_items: [],
    transactions: [],
  };

  if (session.has("user_id")) {
    const user_id = session.get("user_id");
    if (user_id) {
      response.user = getUserById(parseInt(user_id));
      const gained_stars = response.user.aoc_id && getStarsForUser(response.user.aoc_id);
      if (response.user.gained_stars !== gained_stars && gained_stars) {
        updateUserStars(parseInt(user_id), gained_stars);
        response.user = getUserById(parseInt(user_id));
      }
    }
  }

  response.shop_items = getShopItems();
  response.transactions = response.user ? getTransactionsByUserId(response.user.id) : [];

  return response;
}

export default function Index() {
  const { user, shop_items, transactions } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1 className="text-8xl font-display bg-clip-text text-transparent bg-gradient-to-t from-white to-green-50">Advent of Code</h1>
      <UserLogin user={user} />
      <div className="flex flex-row md:flex-col">
        <Shop shop_items={shop_items} />
        <MyTransactions transactions={transactions} />
      </div>
      <SnowParticles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color="#ffffff"
        size={1.5}
        staticity={60}
        vy={1.1}
      />
    </div>
  );
}
