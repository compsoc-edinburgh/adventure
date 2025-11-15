import { LoaderFunctionArgs, redirect } from "react-router";
import { requireUserSession } from "../sessions";
import { getShopItems, getTransactions, getUserById, getUsers } from "../sqlite.server";
import { getStarForAllUsers } from "../stars.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireUserSession(request);
  if (!session) {
    return redirect("/login");
  }

  const user = getUserById(parseInt(session.get("user_id")!));
  if (!user || !user.is_admin) {
    return redirect("/");
  }

  let type = new URL(request.url).searchParams.get("type");
  if (type === null || !["transactions", "users", "items"].includes(type)) {
    return new Response(JSON.stringify({
      error: "Invalid type: must be transactions, users, or items",
    }), {
      status: 400,
    });
  }

  let data = "";
  if (type === "transactions") {
    const transactions = getTransactions();

    data = "id, user_id, shop_item_id, transaction_time, cancelled_at\n";
    transactions.forEach((txn) => {
      data += `${txn.id}, ${txn.user_id}, ${txn.shop_item_id}, ${txn.transaction_time}, ${txn.cancelled_at}\n`;
    });
  }
  else if (type === "users") {
    const users = getUsers();
    const raw_stars = getStarForAllUsers();

    data = "id, aoc_id, is_admin, is_physically_in_edinburgh, email, discord_id, last_login_stars, raw_stars, registered_at, deleted_at\n";
    users.forEach((usr) => {
      data += `${usr.id}, ${usr.aoc_id}, ${usr.is_admin}, ${usr.is_physically_in_edinburgh}, ${usr.email}, ${usr.discord_id}, ${usr.gained_stars}, ${(usr.aoc_id && usr.aoc_id in raw_stars) ? raw_stars[usr.aoc_id] : 0}, ${usr.registered_at}, ${usr.deleted_at}\n`;
    });
  }
  else if (type === "items") {
    const items = getShopItems();

    data = "id, name, stock_count, star_cost, max_per_user, description, image_url, order\n";
    items.forEach((item) => {
      data += `${item.id}, ${item.name}, ${item.stock_count}, ${item.star_cost}, ${item.max_per_user}, ${item.description}, ${item.image_url}, ${item.order}\n`;
    });
  }

  const date = new Date().toISOString();

  return new Response(data, {
    headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="aoc-eshop-${type}-${date}.csv"` },
  });
}
