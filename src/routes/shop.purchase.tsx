import { ActionFunctionArgs } from "@remix-run/node";
import { getShopItems, db, getTransactionsByUserId, getUserById, getTransactionsByItemId, createTransaction, ShopTransaction } from "../sqlite.server";
import { requireUserSession } from "../sessions";

export async function action({ request }: ActionFunctionArgs) {
  const session = await requireUserSession(request);
  if (!session) {
    return Response.json({
      success: false,
      message: "You must be logged in to purchase items.",
    }, {
      status: 401,
    });
  };

  const user_id = parseInt(session.get("user_id")!);
  const formData = await request.formData();
  const purchase_item_id = formData.get("shop_item_id");
  if (typeof purchase_item_id !== "string") {
    return Response.json({
      success: false,
      message: "Invalid item ID format.",
    }, {
      status: 400,
    });
  }

  const shop_items = getShopItems();
  const item = shop_items.find(i => i.id === parseInt(purchase_item_id!));
  if (!item) {
    return Response.json({
      success: false,
      message: "Item ID does not exist.",
    }, {
      status: 404,
    });
  }

  // In one transaction, check that the user has enough money to purchase the
  // item, that the transaction count hasn't exceeded the count of the item, and
  // that the user hasn't already purchased the item. Then, perform the purchase
  // by adding a transaction entry.

  let transaction: undefined | ShopTransaction = undefined;
  let transactionFailureMessage: string | null = null;

  const runTx = db.transaction(() => {
    // First check that user's total stars minus the total cost of all their
    // past transactions still has enough stars to purchase the item.
    const user = getUserById(user_id);

    // Unverified users can't purchase items
    if (!user.is_physically_in_edinburgh || user.email == null) {
      transactionFailureMessage = "Please finish setting up your account at /setup before purchasing items.";
      return;
    }

    const transactions = getTransactionsByUserId(user_id);
    const total_cost = transactions.reduce((acc, t) => {
      const item = shop_items.find(i => i.id === t.shop_item_id);
      if (!item || t.cancelled_at) {
        return acc;
      }
      return acc + item.star_cost;
    }, 0);

    if (user.gained_stars - total_cost - item.star_cost < 0) {
      transactionFailureMessage = "You do not have enough stars to purchase this item.";
      return;
    }

    // Next check that the item is in stock by counting the number of
    // transactions for this item.
    const transactionsForItem = getTransactionsByItemId(item.id);
    const bought_count = transactionsForItem.filter(t => !t.cancelled_at).length;
    if (bought_count >= item.stock_count) {
      transactionFailureMessage = "This item is out of stock. But someone may cancel their order, so check back later!";
      return;
    }

    // Finally, check that we won't exceed the limit of max per user.
    if (transactionsForItem.filter(t => !t.cancelled_at).filter(t => t.user_id === user_id).length >= item.max_per_user) {
      transactionFailureMessage = `You can only buy max ${item.max_per_user} of this item.`;
      return;
    }

    // If all checks pass, create the entry
    return createTransaction(user_id, item.id);
  });

  transaction = runTx();
  if (transactionFailureMessage) {
    return Response.json({
      success: false,
      message: transactionFailureMessage,
    });
  }

  if (!transaction) {
    return Response.json({
      success: false,
      message: "Failed to create transaction.",
    }, {
      status: 500,
    });
  }

  return {
    success: true,
    transaction_id: transaction.id,
  };
}
