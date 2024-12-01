import { LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useLoaderData } from "@remix-run/react";
import { requireUserSession } from "../sessions";
import { getTransactions, getUserById } from "../sqlite.server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/Table";

export default function Items() {
  const { transactions } = useLoaderData<typeof loader>();
  return (
    <>
      <h2 className="text-2xl font-display mb-3">Transactions</h2>
      <Table className="bg-white">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Shop Item ID</TableHead>
            <TableHead>Cancelled At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map(transaction => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.id}</TableCell>
              <TableCell>{transaction.user_id}</TableCell>
              <TableCell>{transaction.shop_item_id}</TableCell>
              <TableCell>{transaction.cancelled_at}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireUserSession(request);
  if (!session) {
    return redirect("/login");
  }

  const user = getUserById(parseInt(session.get("user_id")!));
  if (!user || !user.is_admin) {
    return redirect("/");
  }

  const transactions = getTransactions();

  return { transactions };
}
