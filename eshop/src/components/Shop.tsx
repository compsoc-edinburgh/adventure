import { useEffect, useState, type FunctionComponent } from "react";
import { ShopItemWithRemaining } from "../sqlite.server";
import { useFetcher } from "react-router";
import { action as shopPurchaseAction } from "../routes/shop.purchase";
import Stars from "./Stars";
import { MdClose } from "react-icons/md";
import { cutoffTime } from "../cutoff";
import { Button } from "./Button";
import NumberFlow from "@number-flow/react";

type ShopProps = {
  shop_items: ShopItemWithRemaining[];
  className?: string;
};

export const Shop: FunctionComponent<ShopProps> = ({ shop_items, className }) => {
  const fetcher = useFetcher<typeof shopPurchaseAction>();
  // useFetcher doesn't have a way to reset/clear the state once one request is
  // performed, meaning if we get an error in the first request and want to
  // dismiss a modal or something, we can't directly change fetcher.data.
  // To work around this, we maintain a copy of the fetcher data.
  const [fetcherData, setFetcherData] = useState<{
    success: boolean;
    message: undefined;
    transaction_id: number;
  }>();

  useEffect(() => {
    if (fetcher.state === "submitting" || fetcher.state === "loading") {
      setFetcherData(undefined);
    }
    else if (fetcher.state === "idle") {
      setFetcherData(fetcher.data);
    }
  }, [fetcher.state, fetcher.data]);

  const isPostCutoff = new Date().getTime() > cutoffTime.getTime();

  return (
    <div className={"mx-4 flex flex-col " + className}>
      <h2 className="text-4xl font-display mb-4 relative self-start text-white">
        <div className="w-full bg-christmasDark bg-opacity-80 backdrop-blur-md h-full absolute top-0 left-0 z-[-1] scale-110 -skew-x-12 -rotate-2 transform-gpu" />
        Reward Shop
      </h2>
      {fetcherData && !fetcherData.success && (
        <div
          className="text-white p-4 rounded-lg mb-4 flex flex-row justify-between animate-slidein origin-top bg-[repeating-linear-gradient(-45deg,var(--tw-gradient-stops))] from-christmasRed from-[length:0_10px] to-christmasRedAccent to-[length:10px_20px]"
        >
          <p className="font-semibold text-lg">{fetcherData.message}</p>
          <button onClick={() => setFetcherData(undefined)}>
            <MdClose />
          </button>
        </div>
      )}
      {isPostCutoff && (
        <div className="text-white p-4 rounded-lg mb-4 flex flex-row justify-between animate-slidein origin-top bg-[repeating-linear-gradient(-45deg,var(--tw-gradient-stops))] from-christmasRed from-[length:0_10px] to-christmasRedAccent to-[length:10px_20px]">
          <p className="font-semibold text-lg">
            The shop has closed as of
            {" "}
            {cutoffTime.toLocaleDateString([], {
              timeZone: "Europe/London",
            },
            )}
            {" "}
            {cutoffTime.toLocaleTimeString([], {
              hour: "2-digit", minute: "2-digit",
              timeZone: "Europe/London",
            })}
            {" "}
            UK time.
            <br />
            {" "}
            Please await further announcement via your registered email or Discord for your reward collection!
          </p>
        </div>
      )}
      <ul className="grid grid-cols-2 grid-rows-3 md:grid-cols-4 xl:grid-rows-2 gap-4">
        {shop_items.map((item, i) => (
          <li key={item.id} className={(i % 3 == 0 ? "bg-christmasGreen" : i % 3 == 1 ? "bg-christmasRed" : "bg-christmasDark") + " transform-gpu overflow-hidden rounded-xl group relative flex flex-col " + (i == 0 ? "row-span-2 col-span-2" : "row-span-1 col-span-2 aspect-[2] xl:col-span-1 xl:aspect-square")}>
            <img src={item.image_url} alt={item.name} className="[mask-image:linear-gradient(to_top,transparent_00%,#000_100%)] group-hover:scale-105 transition-all duration-150" />
            <div className={`absolute top-0 right-0 text-white p-2 ${item.remaining_count === 0 ? "bg-christmasRed" : "bg-black"} bg-opacity-50 rounded-bl-xl`}>
              <NumberFlow value={item.remaining_count} />
              {" "}
              in stock
            </div>
            <div className="absolute bottom-0 flex transform-gpu flex-col gap-1 p-4 transition-all duration-150 group-hover:-translate-y-12 w-full">
              <h3 className={`text-xl font-semibold text-white ${item.remaining_count === 0 ? "line-through" : ""}`}>
                {item.name}
              </h3>
              <p className="max-w-lg text-white">{item.description}</p>
            </div>
            <div
              className="absolute bottom-0 w-full translate-y-10 transform-gpu flex justify-between items-center p-4 opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100"
            >
              <Stars amount={item.star_cost} className="text-christmasBeige" />
              {!isPostCutoff && (
                <fetcher.Form method="post" action="shop/purchase">
                  <input type="hidden" name="shop_item_id" value={item.id} />
                  <Button type="submit" bg="beige" className="pointer-events-auto py-2 px-4">{item.remaining_count === 0 ? "Out of Stock" : "Exchange"}</Button>
                </fetcher.Form>
              )}
            </div>
            <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-150 group-hover:bg-black/[.03]" />
            {" "}
          </li>
        ))}
      </ul>
    </div>
  );
};
