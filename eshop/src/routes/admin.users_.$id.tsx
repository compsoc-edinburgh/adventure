import { LoaderFunctionArgs, redirect, useLoaderData } from "react-router";
import { requireUserSession } from "../sessions";
import { getTransactionsByUserId, getUserById } from "../sqlite.server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/Table";

export default function User() {
  const { user, transactions } = useLoaderData<typeof loader>();
  return (
    <>
      <h2 className="text-2xl font-display mb-3">User Summary</h2>
      <Table className="bg-white">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>AoC ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Physically in Edinburgh</TableHead>
            <TableHead>Is Admin</TableHead>
            <TableHead>Stars</TableHead>
            <TableHead>Registered At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.aoc_id}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.is_physically_in_edinburgh ? "Yes" : "No"}</TableCell>
            <TableCell>{user.is_admin ? "Yes" : "No"}</TableCell>
            <TableCell>{user.gained_stars}</TableCell>
            <TableCell>{user.registered_at}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <h2 className="text-2xl font-display my-3">Transactions</h2>
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
export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await requireUserSession(request);
  if (!session) {
    return redirect("/login");
  }

  const user = getUserById(parseInt(session.get("user_id")!));
  if (!user || !user.is_admin) {
    return redirect("/");
  }

  const targetUserId = params.id;
  if (!targetUserId || isNaN(parseInt(targetUserId))) {
    return redirect("/admin/users");
  }

  const targetUser = getUserById(parseInt(targetUserId));
  const transactions = getTransactionsByUserId(parseInt(targetUserId));

  return { user: targetUser, transactions };
}
