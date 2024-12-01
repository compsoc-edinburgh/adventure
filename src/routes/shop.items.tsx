import { LoaderFunctionArgs } from "@remix-run/node";
import { db, getShopItems, getTransactions, ShopItemWithRemaining } from "../sqlite.server";

export async function loader({
  // eslint-disable-next-line no-unused-vars
  request,
}: LoaderFunctionArgs) {
  const { items, transactions } = db.transaction(() => {
    return { items: getShopItems() as ShopItemWithRemaining[], transactions: getTransactions() };
  })();

  if (!items || !transactions) {
    throw new Error("Failed to load shop items and transactions");
  }

  // For each item, calculate the remaining stock
  for (const item of items) {
    item.remaining_count = item.stock_count - transactions.filter(t => t.shop_item_id === item.id && !t.cancelled_at).length;
  }
  return items;
}
