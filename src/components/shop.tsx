import type { FunctionComponent } from "react";
import { ShopItem } from "../sqlite.server";
import { useFetcher } from "@remix-run/react";
import { action as shopPurchaseAction } from "../routes/shop.purchase";
import Stars from "./Stars";

type ShopProps = {
  shop_items: ShopItem[];
};

export const Shop: FunctionComponent<ShopProps> = ({ shop_items }) => {
  const fetcher = useFetcher<typeof shopPurchaseAction>();
  return (
    <div>
      <h2 className="text-3xl font-display mb-4">Reward Shop</h2>
      {fetcher.data && !fetcher.data["success"] && <p>{fetcher.data["message"]}</p>}
      <ul className="grid grid-cols-2 grid-rows-3 lg:grid-cols-3 lg:grid-rows-2 gap-4">
        {shop_items.map((item, i) => (
          <li key={item.id} className={"bg-christmasBeigeAccent transform-gpu overflow-hidden rounded-xl group relative flex flex-col " + (i == 0 ? "row-span-2 col-span-2" : "row-span-1 col-span-1")}>
            <img src={item.image_url} alt={item.name} className="[mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105 transition-all duration-150" />
            <div className="absolute bottom-0 flex transform-gpu flex-col gap-1 p-6 transition-all duration-150 group-hover:-translate-y-10 w-full">
              <h3 className="text-xl font-semibold text-christmasDark dark:text-neutral-300">
                {item.name}
              </h3>
              <p className="max-w-lg text-christmasDark opacity-50">{item.description}</p>
            </div>
            <div
              className="absolute bottom-0 w-full translate-y-10 transform-gpu flex justify-between items-center p-6 opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100"
            >
              <Stars amount={item.star_cost} />
              <fetcher.Form method="post" action="shop/purchase">
                <input type="hidden" name="shop_item_id" value={item.id} />
                <button type="submit" className="pointer-events-auto bg-christmasRed text-white rounded-md py-2 px-4 active:scale-95 transition-all duration-75 focus:outline-4 focus:outline-christmasRed focus:outline-double">Exchange</button>
              </fetcher.Form>
            </div>
            <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-150 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
            {" "}
          </li>
        ))}
      </ul>
    </div>
  );
};
