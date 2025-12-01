import { Link, Links, Meta, MetaFunction, Outlet, Scripts, useLoaderData } from "react-router";

import type { LinksFunction, LoaderFunctionArgs } from "react-router";
import stylesheet from "./tailwind.css?url";
import SnowParticles from "./components/Particles";
import { CompSocLogo } from "./components/CompSocLogo";
import { Ornament1 } from "./components/Ornament1";
import { Tree } from "./components/Tree";
import UserLogin from "./components/UserLogin";
import { getSession } from "./sessions";
import { getUserById, User } from "./sqlite.server";
import { getNameForUser, starsLastUpdated } from "./stars.server";
import favicon from "./assets/favicon.ico";
import appleTouchIcon from "./assets/apple-touch-icon.png";
import { Footer } from "./components/Footer";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Berkshire+Swash&display=swap",
  },
  { rel: "icon", href: favicon },
  { rel: "apple-touch-icon", href: appleTouchIcon },
];

export const meta: MetaFunction = () => {
  return [
    {
      title: "Advent of Code Rewards - by CompSoc",
    },
    {
      property: "og:title",
      content: "Advent of Code Rewards - by CompSoc",
    },
    {
      name: "description",
      content: "Get rewards for completing Advent of Code challenges!",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );

  const response: { user: User | undefined; aoc_name: string | undefined; next_run: number | undefined; last_updated: number } = {
    user: undefined,
    aoc_name: "",
    next_run: undefined,
    last_updated: 0,
  };

  if (session.has("user_id")) {
    const user_id = session.get("user_id");
    if (user_id) {
      response.user = getUserById(parseInt(user_id));
      response.aoc_name = response.user.aoc_id ? getNameForUser(response.user.aoc_id) : undefined;
    };
  }

  // Set last star update time
  const lastUpdated = starsLastUpdated();
  response.last_updated = lastUpdated.getTime();

  // Get the next run
  const currentTime = new Date();
  let currentMinutes = currentTime.getMinutes();
  if ([0, 15, 30, 45].includes(currentMinutes) && lastUpdated.getMinutes() !== currentMinutes) {
    // There should be a run right now but last updated doesn't match; it's likely currently running
    response.next_run = undefined;
  }
  else {
    response.next_run = (Math.floor(currentTime.getTime() / (15 * 60 * 1000)) + 1) * (15 * 60 * 1000);
  };

  return response;
};

export default function App() {
  const { user, aoc_name, next_run, last_updated } = useLoaderData<typeof loader>();
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
          <div className="flex flex-col mt-16 mb-8 items-center">
            <a href="https://comp-soc.com">
              <CompSocLogo className="w-8 absolute left-0 top-0 m-4 opacity-50 hover:opacity-100" />
            </a>
            <Link to="/">
              <h1 className="md:text-7xl text-4xl text-center font-display bg-clip-text text-transparent bg-gradient-to-t from-christmasRed to-christmasRedAccent">Advent of Code Rewards</h1>
              <span className="text-center sm:text-right font-display block -mt-2">2025 Edition</span>
            </Link>
            <Ornament1 className="w-56 -mt-3" />
          </div>
          <div className="absolute top-0 right-0 flex-row gap-1 items-center justify-end hidden sm:flex">
            <div className="flex flex-col items-end gap-0 text-xs opacity-75">
              <span>
                {
                  next_run === undefined
                    ? "Refresh for latest synced data"
                    : `Next sync with AoC is at ${new Date(next_run).toLocaleTimeString([], {
                      hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3,
                      timeZone: "Europe/London",
                    })}`
                }
              </span>
              <span>
                {`Last sync at ${new Date(last_updated).toLocaleTimeString([], {
                  hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3,
                  timeZone: "Europe/London",
                })}`}
              </span>
            </div>
            <UserLogin user={user} aoc_name={aoc_name} />
          </div>

          <Outlet />

          <Footer />
        </div>

        <SnowParticles
          className="fixed inset-0"
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
