import { ActionFunctionArgs, LoaderFunctionArgs, redirect, useLoaderData, useFetcher } from "react-router";
import { commitSession, requireUserSession } from "../sessions";
import { createShopItem, getShopItems, getUserById, updateShopItem } from "../sqlite.server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/Table";
import { useCallback, useState } from "react";
import Input from "../components/Input";
import { Button } from "../components/Button";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";

export default function Items() {
  const { error, shopItems } = useLoaderData<typeof loader>();
  const [name, setName] = useState<string | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [starCost, setStarCost] = useState<string | undefined>(undefined);
  const [stockCount, setStockCount] = useState<string | undefined>(undefined);
  const [maxPerUser, setMaxPerUser] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<string | undefined>(undefined);

  const fetcher = useFetcher();

  // Handler to move an item up or down by instantaneously changing the
  // contents of the 'order' input box and submitting the form. Used for up/down
  // arrows.
  const moveItem = useCallback((e: React.MouseEvent<HTMLButtonElement>, by: number) => {
    (document.getElementById("order") as HTMLInputElement).valueAsNumber += by;
    fetcher.submit(e.currentTarget.form, {
      method: "POST",
    });
  }, [fetcher]);

  return (
    <>
      <h2 className="text-2xl font-display mb-3">Shop Items</h2>
      <div className="flex gap-2 w-full justify-end items-center mb-2">
        <Button component="a" href="/admin/download?type=items" className="px-4 py-1" bg="beige">Download as CSV</Button>
      </div>
      <Table className="bg-white">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Image URL</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Star Cost</TableHead>
            <TableHead>Stock Count</TableHead>
            <TableHead>Max per User</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shopItems.slice().sort((a, b) => a.order - b.order).map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.order}</TableCell>
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
      <fetcher.Form method="post" action="/admin/items" className="p-6 bg-christmasBeigeAccent shadow-sm rounded-lg mt-8">
        <select
          name="_method"
          onChange={(e) => {
            const editingItem = shopItems.find(item => item.id == parseInt(e.target.value));
            setName(editingItem?.name ?? "");
            setImageUrl(editingItem?.image_url ?? "");
            setDescription(editingItem?.description ?? "");
            setStarCost(editingItem?.star_cost?.toString() ?? "");
            setStockCount(editingItem?.stock_count?.toString() ?? "");
            setMaxPerUser(editingItem?.max_per_user?.toString() ?? "");
            setOrder(editingItem?.order.toString() ?? "");
          }}
        >
          <option value="new">Add Item</option>
          {shopItems.map(item => (
            <option key={item.id} value={item.id}>
              Edit
              {" "}
              {item.name}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-4">
          <Input type="text" label="Name" placeholder="Name" name="name" value={name} onChange={e => setName(e.target.value)} />

          <Input type="text" label="Image URL" placeholder="Image URL" name="image_url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />

          <Input type="text" label="Description" placeholder="Description" name="description" value={description} onChange={e => setDescription(e.target.value)} />

          <Input type="number" label="Star Cost" placeholder="Star Cost" name="star_cost" value={starCost} onChange={e => setStarCost(e.target.value)} />

          <Input type="number" label="Stock Count" placeholder="Stock Count" name="stock_count" value={stockCount} onChange={e => setStockCount(e.target.value)} />

          <Input type="number" label="Max per User" placeholder="Max per User" name="max_per_user" value={maxPerUser} onChange={e => setMaxPerUser(e.target.value)} />

          {order && (
            <>
              <Input
                type="number"
                label="Swap Order with..."
                placeholder="Order"
                name="order"
                value={order}
                inputProps={{
                  min: 0,
                  max: shopItems.length - 1,
                  id: "order",
                }}
                onChange={e => setOrder(e.target.value)}
              />
              <div className="flex gap-2 items-end">
                <Button className="py-4 px-4" onClick={e => moveItem(e, -1)} disabled={order === "0"}><AiOutlineUp className="text-sm" /></Button>
                <Button className="py-4 px-4" onClick={e => moveItem(e, 1)} disabled={order === (shopItems.length - 1).toString()}><AiOutlineDown className="text-sm" /></Button>
              </div>
            </>
          )}
        </div>

        <button type="submit" className="block relative w-full mt-3 px-6 py-2 rounded-lg bg-christmasRed text-white active:scale-95 transition-all duration-75 focus:outline-4 focus:outline-christmasRed focus:outline-double">Save</button>
        {error && <p className="text-christmasRedAccent text-sm mt-3 min-w-full w-0">{error}</p>}
      </fetcher.Form>
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

  return { error: session.get("error"), shopItems };
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await requireUserSession(request);
  if (!session) {
    return redirect("/login");
  }

  const user = getUserById(parseInt(session.get("user_id")!));
  if (!user || !user.is_admin) {
    return redirect("/");
  }

  const formData = await request.formData();
  const method = formData.get("_method");

  if (typeof method !== "string") {
    session.flash("error", "No method provided.");
    return redirect("/admin/items", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  const name = formData.get("name");
  const image_url = formData.get("image_url");
  const description = formData.get("description");
  const star_cost = parseInt(formData.get("star_cost") as string);
  const stock_count = parseInt(formData.get("stock_count") as string);
  const max_per_user = parseInt(formData.get("max_per_user") as string);
  const order = parseInt(formData.get("order") as string);
  if (typeof name !== "string" || typeof image_url !== "string" || typeof description !== "string" || typeof star_cost !== "number" || typeof stock_count !== "number" || typeof max_per_user !== "number" || typeof order !== "number") {
    session.flash("error", "Fields have the wrong type.");
    return redirect("/admin/items", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (method == "new") {
    // Add the item to the database
    createShopItem(image_url, name, description, star_cost, stock_count, max_per_user);
  }
  else {
    if (isNaN(parseInt(method))) {
      session.flash("error", "Invalid item ID format.");
      return redirect("/admin/items", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    // Edit the item in the database
    updateShopItem(parseInt(method as string), image_url, name, description, star_cost, stock_count, max_per_user, order);
  }

  return redirect("/admin/items");
};
