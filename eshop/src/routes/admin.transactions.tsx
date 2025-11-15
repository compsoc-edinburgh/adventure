import { LoaderFunctionArgs, redirect, useLoaderData } from "react-router";
import { requireUserSession } from "../sessions";
import { getTransactions, getUserById } from "../sqlite.server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/Table";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

export default function Items() {
  const { transactions } = useLoaderData<typeof loader>();
  const [excludeCancelled, setExcludeCancelled] = useState<boolean>(false);

  useEffect(() => {
    if (window.localStorage.getItem("admin_exclude_cancelled") === "true") {
      setExcludeCancelled(true);
    };
  }, [setExcludeCancelled]);

  const onSetExcludeCancelled = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setExcludeCancelled(e.target.checked);
    window.localStorage.setItem("admin_exclude_cancelled", e.target.checked.toString());
  }, [setExcludeCancelled]);

  return (
    <>
      <h2 className="text-2xl font-display mb-3">Transactions</h2>
      <fieldset className="flex gap-2 w-full justify-end">
        <label htmlFor="setExcludeCancelled">Show only valid transactions</label>
        <input id="setExcludeCancelled" type="checkbox" checked={excludeCancelled} onChange={onSetExcludeCancelled} />
      </fieldset>
      <Table className="bg-white">
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Shop Item ID</TableHead>
            <TableHead>Cancelled At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.filter(txn => !excludeCancelled || txn.cancelled_at === null).map(transaction => (
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
