import type { FunctionComponent } from "react";
import { ShopItem } from "../sqlite.server";

type ShopProps = {
  shop_items: ShopItem[];
};

export const Shop: FunctionComponent<ShopProps> = ({ shop_items }) => {
  console.log(shop_items);
  return (
    <div>
      <h1>Shop</h1>
      <ul>
        {shop_items.map(item => (
          <li key={item.id}>
            {item.name}
            {" "}
            -
            {" "}
            {item.star_cost}
          </li>
        ))}
      </ul>
    </div>
  );
};
