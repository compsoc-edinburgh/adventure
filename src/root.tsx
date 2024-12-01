import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
} from "@remix-run/react";

import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import stylesheet from "./tailwind.css?url";
import SnowParticles from "./components/Particles";
import { CompSocLogo } from "./components/CompSocLogo";
import { Ornament1 } from "./components/Ornament1";
import { Tree } from "./components/Tree";
import UserLogin from "./components/UserLogin";
import { getSession } from "./sessions";
import { getUserById, User } from "./sqlite.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fredericka+the+Great&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Rye&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );

  const response: { user: User | undefined } = {
    user: undefined,
  };

  if (session.has("user_id")) {
    const user_id = session.get("user_id");
    if (user_id) {
      response.user = getUserById(parseInt(user_id));
    };
  }

  return response;
};

export default function App() {
  const { user } = useLoaderData<typeof loader>();
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
      <body className="bg-christmasBeige text-christmasDark">

        <div className="w-full">
          <div className="absolute inset-0 top-0 left-0 overflow-hidden -z-10">
            <Tree className="absolute h-full -left-12 opacity-25 md:opacity-100" />
          </div>
          <div className="flex flex-col mt-8 mb-8 items-center">
            <CompSocLogo className="w-32 opacity-50 mb-4" />
            <Link to="/">
              <h1 className="md:text-7xl text-4xl text-center font-display bg-clip-text text-transparent bg-gradient-to-t from-christmasDark to-christmasRed">Advent of Code Rewards</h1>
            </Link>
            <Ornament1 className="w-56 -mt-3" />
          </div>
          <UserLogin user={user} className="absolute top-0 right-0" />

          <Outlet />
        </div>

        <SnowParticles
          className="absolute inset-0"
          quantity={100}
          ease={80}
          color="#ffffff"
          size={3}
          staticity={60}
          vy={1.1}
        />
        <Scripts />
      </body>
    </html>
  );
}
