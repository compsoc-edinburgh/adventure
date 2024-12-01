import { LoaderFunctionArgs } from "@remix-run/node";
import { getShopItems } from "../sqlite.server";

export async function loader({
  // eslint-disable-next-line no-unused-vars
  request,
}: LoaderFunctionArgs) {
  const items = getShopItems();
  return items;
}
