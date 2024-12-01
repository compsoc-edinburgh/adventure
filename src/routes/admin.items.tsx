import { LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useLoaderData } from "@remix-run/react";
import { requireUserSession } from "../sessions";
import { getShopItems, getUserById } from "../sqlite.server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/Table";

export default function Items() {
  const { shopItems } = useLoaderData<typeof loader>();
  return (
    <>
      <h2 className="text-2xl font-display mb-3">Shop Items</h2>
      <Table className="bg-white">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Image URL</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Star Cost</TableHead>
            <TableHead>Stock Count</TableHead>
            <TableHead>Max per User</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shopItems.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.image_url}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.star_cost}</TableCell>
              <TableCell>{item.stock_count}</TableCell>
              <TableCell>{item.max_per_user}</TableCell>
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

  const shopItems = getShopItems();

  return { shopItems };
}
