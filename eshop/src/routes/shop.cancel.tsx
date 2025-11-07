import { ActionFunctionArgs } from "react-router";
import { cancelTransaction, getTransactionsByUserId } from "../sqlite.server";
import { requireUserSession } from "../sessions";
import { cutoffTime } from "../cutoff";

export async function action({ request }: ActionFunctionArgs) {
  // Disable shop after 23:59 on 12 January 2025 UK time
  if (new Date().getTime() > cutoffTime.getTime()) {
    return Response.json({
      success: false,
      message: "The shop is now closed (as of 23:59 on 12 January 2025). Your purchase list cannot be modified.",
    }, {
      status: 403,
    });
  }

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

  if (valid.cancelled_at) {
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
