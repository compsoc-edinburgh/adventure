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
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fredericka+the+Great&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Rye&display=swap",
  }
];

export default function App() {
  return (
    <html>
      <head>
        <link
          rel="icon"
          href="data:image/x-icon;base64,AA"
        />
        <Meta />
        <Links />
      </head>
      <body className="bg-[#516152] text-white">
        <h1 className="text-8xl font-display bg-clip-text text-transparent bg-gradient-to-t from-white to-green-50">Advent of Code</h1>
        <p>asd</p>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}