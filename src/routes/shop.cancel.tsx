import { ActionFunctionArgs } from "@remix-run/node";
import { cancelTransaction, getTransactionsByUserId } from "../sqlite.server";
import { requireUserSession } from "../sessions";

export async function action({ request }: ActionFunctionArgs) {
  const session = await requireUserSession(request);
  if (!session) {
    return Response.json({
      success: false,
      message: "Unauthorized",
    }, { status: 401 });
  }

  const transaction_id = (await request.formData()).get("transaction_id");

  if (typeof transaction_id !== "string") {
    return Response.json({
      success: false,
      message: "Invalid transaction number format",
    }, { status: 400 });
  }

  // Check that this is a valid transaction owned by the user
  const valid = getTransactionsByUserId(parseInt(session.get("user_id") || "")).find(
    t => t.id === parseInt(transaction_id),
  );

  if (!valid) {
    return Response.json({
      success: false,
      message: "Transaction not found for user",
    }, { status: 404 });
  }

  if (!valid.is_valid) {
    return Response.json({
      success: false,
      message: "Transaction is already cancelled",
    }, { status: 400 });
  }

  // Cancel the transaction
  cancelTransaction(parseInt(transaction_id));

  return Response.json({
    success: true,
    message: "Transaction cancelled",
  });
}
