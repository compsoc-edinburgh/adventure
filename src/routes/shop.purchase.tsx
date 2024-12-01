import { ActionFunctionArgs } from "@remix-run/node";
import { getShopItems, db, getTransactionsByUserId, getUserById, getTransactionsByItemId, createTransaction, ShopTransaction } from "../sqlite.server";
import { requireUserSession } from "../sessions";

export async function action({ request }: ActionFunctionArgs) {
  const session = await requireUserSession(request).catch(() => {
    throw new Response("You must be logged in to purchase items.", {
      status: 401,
    });
  });

  const user_id = parseInt(session.get("user_id")!);
  const formData = await request.formData();
  const purchase_item_id = formData.get("shop_item_id");
  if (typeof purchase_item_id !== "string") {
    throw new Response("Invalid item ID format.", {
      status: 400,
    });
  }

  const shop_items = getShopItems();
  const item = shop_items.find(i => i.id === parseInt(purchase_item_id!));
  if (!item) {
    throw new Response("Item ID does not exist.", {
      status: 404,
    });
  }

  // In one transaction, check that the user has enough money to purchase the
  // item, that the transaction count hasn't exceeded the count of the item, and
  // that the user hasn't already purchased the item. Then, perform the purchase
  // by adding a transaction entry.

  let transaction: null | ShopTransaction = null;

  const runTx = db.transaction(() => {
    // First check that user's total stars minus the total cost of all their
    // past transactions still has enough stars to purchase the item.
    const user = getUserById(user_id);
    const transactions = getTransactionsByUserId(user_id);
    const total_cost = transactions.reduce((acc, t) => {
      const item = shop_items.find(i => i.id === t.shop_item_id);
      if (!item) {
        return acc;
      }
      return acc + item.star_cost;
    }, 0);

    if (user.gained_stars - total_cost - item.star_cost < 0) {
      throw new Response("You do not have enough stars to purchase this item.", {
        status: 400,
      });
    }

    // Next check that the item is in stock by counting the number of
    // transactions for this item.
    const transactionsForItem = getTransactionsByItemId(item.id);
    const bought_count = transactionsForItem.filter(t => t.is_valid).length;
    if (bought_count >= item.stock_count) {
      throw new Response("This item is out of stock.", {
        status: 400,
      });
    }

    // Finally, check that the user hasn't already purchased this item.
    if (transactionsForItem.some(t => t.user_id === user_id)) {
      throw new Response("You have already purchased this item.", {
        status: 400,
      });
    }

    // If all checks pass, create the entry
    return createTransaction(user_id, item.id);
  });

  transaction = runTx();

  if (!transaction) {
    throw new Response("Failed to create transaction.", {
      status: 500,
    });
  }

  return {
    transaction_id: transaction.id,
  };
}
