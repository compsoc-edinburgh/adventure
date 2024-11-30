import {
  Links,
  Meta,
  Outlet,
  Scripts,
} from "@remix-run/react";

import type { LinksFunction } from "@remix-run/node";
import stylesheet from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fredericka+the+Great&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Rye&display=swap",
  },
];

export default function App() {
  return (
    <html lang="en-us">
      <head>
        <link
          rel="icon"
          href="data:image/x-icon;base64,AA"
        />
        <Meta />
        <Links />
      </head>
      <body className="bg-[#516152] text-white">
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
