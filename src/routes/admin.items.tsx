import { ActionFunctionArgs, LoaderFunctionArgs, Form, redirect, useLoaderData } from "react-router";
import { commitSession, requireUserSession } from "../sessions";
import { createShopItem, getShopItems, getUserById, updateShopItem } from "../sqlite.server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/Table";
import { useState } from "react";
import Input from "../components/Input";

export default function Items() {
  const { error, shopItems } = useLoaderData<typeof loader>();
  const [name, setName] = useState<string | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [starCost, setStarCost] = useState<string | undefined>(undefined);
  const [stockCount, setStockCount] = useState<string | undefined>(undefined);
  const [maxPerUser, setMaxPerUser] = useState<string | undefined>(undefined);
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
      <Form method="post" action="/admin/items" className="p-6 bg-christmasBeigeAccent shadow-sm rounded-lg mt-8">
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
        </div>

        <button type="submit" className="block relative w-full mt-3 px-6 py-2 rounded-lg bg-christmasRed text-white active:scale-95 transition-all duration-75 focus:outline-4 focus:outline-christmasRed focus:outline-double">Save</button>
        {error && <p className="text-christmasRedAccent text-sm mt-3 min-w-full w-0">{error}</p>}
      </Form>
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
  if (typeof name !== "string" || typeof image_url !== "string" || typeof description !== "string" || typeof star_cost !== "number" || typeof stock_count !== "number" || typeof max_per_user !== "number") {
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
    updateShopItem(parseInt(method as string), image_url, name, description, star_cost, stock_count, max_per_user);
  }

  return redirect("/admin/items");
};
