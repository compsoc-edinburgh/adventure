import type { FunctionComponent } from "react";
import { ShopItem } from "../sqlite.server";
import { useFetcher } from "@remix-run/react";

type ShopProps = {
  shop_items: ShopItem[];
};

export const Shop: FunctionComponent<ShopProps> = ({ shop_items }) => {
  const fetcher = useFetcher();
  return (
    <div>
      <h1>Shop</h1>
      <ul>
        {shop_items.map(item => (
          <li key={item.id}>
            <img src={item.image_url} alt={item.name} />
            {" "}
            <br />
            {item.name}
            {" "}
            -
            {item.description}
            <br />
            {item.star_cost}
            {" "}
            stars
            <fetcher.Form method="post" action="shop/purchase">
              <input type="hidden" name="shop_item_id" value={item.id} />
              <button type="submit">Buy</button>
            </fetcher.Form>
          </li>
        ))}
      </ul>
    </div>
  );
};
