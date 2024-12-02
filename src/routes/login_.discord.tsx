import { ActionFunctionArgs } from "@remix-run/node";
import { Link, redirect, useFetcher, useLoaderData, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { AiOutlineDiscord } from "react-icons/ai";
import { commitSession, getSession } from "../sessions";
import { getUserById } from "../sqlite.server";
import { getDiscordIdFromAocId } from "../mappings.server";

export default function LoginDiscord() {
  const location = useLocation();
  const [hash] = useState(location.hash.slice(1));
  const parsedFragment = new URLSearchParams(hash);
  const [accessToken, tokenType] = [parsedFragment.get("access_token"), parsedFragment.get("token_type")];

  const fetcher = useFetcher<typeof action>();

  const [discordUsername, setDiscordUsername] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (accessToken) {
      fetch("https://discord.com/api/users/@me", {
        headers: {
          authorization: `${tokenType} ${accessToken}`,
        },
      })
        .then(result => result.json())
        .then((response) => {
          setDiscordUsername(response.username);
          fetcher.submit({
            discord_id: response.id,
          }, {
            method: "post",
            action: "/login/discord",
          });
        })
        .catch((reason) => {
          setError(String(reason));
        });
    }
  }, [fetcher, accessToken, tokenType]);

  const { discord_oauth_url } = useLoaderData<typeof loader>();
  return (
    <div className="flex items-center justify-center w-full flex-col">
      <h2 className="text-3xl font-display mb-6">Discord Verification</h2>
      {!accessToken && (
        <>
          <Link to="/login" className="text-sm opacity-75">Click to go back</Link>
          <div className="mt-8 w-96 max-w-full">
            <p className="w-0 min-w-full">
              This AoC ID has a linked Discord account. Please confirm this is your account by logging in with Discord.
            </p>
            <a href={discord_oauth_url} className="mt-4 px-6 py-2 rounded-lg bg-[#6488da] text-white active:scale-95 transition-all duration-75 focus:outline-4 focus:outline-[#6488da] focus:outline-double flex flex-row gap-2 items-center">
              <AiOutlineDiscord />
              <span>Login with Discord</span>
            </a>
          </div>
        </>
      )}
      {accessToken && (
        <div className="mt-8 w-96 max-w-full">
          <p className="w-0 min-w-full">
            Receiving information from Discord... Username:
            {discordUsername}
          </p>
        </div>
      )}
      {error && (
        <p className="text-christmasRedAccent text-sm mt-3 min-w-full w-0">{error}</p>
      )}
    </div>
  );
}

export async function loader() {
  const discord_oauth_return_url = process.env.OAUTH_DISCORD_REDIRECT_URI || "";
  const discord_client_id = process.env.OAUTH_DISCORD_CLIENT_ID || "";
  const discord_oauth_url = `https://discord.com/api/oauth2/authorize?client_id=${discord_client_id}&redirect_uri=${encodeURIComponent(discord_oauth_return_url)}&response_type=token&scope=identify`;

  return {
    discord_oauth_url,
  };
};

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );

  if (session.has("user_id")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/");
  }

  if (!session.has("temporary_user_id")) {
    session.flash("error", "You must log in with AoC ID first.");
    // Redirect to the login page if they haven't logged in with AoC ID yet.
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
  const temporary_user_id = session.get("temporary_user_id")!;
  const user = getUserById(parseInt(temporary_user_id));

  const formData = await request.formData();
  const discord_id = formData.get("discord_id");

  // Check that the Discord ID and username are not empty.
  if (typeof discord_id !== "string") {
    session.flash("error", "Invalid form data.");
    session.unset("temporary_user_id");
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // If they already have a Discord ID, check that it matches the one they're trying to link.
  const existing_discord_id = user.discord_id || getDiscordIdFromAocId(user.aoc_id || 0)?.toString();

  if (!existing_discord_id) {
    // If they have no mapping, the user probably manually visited /login/discord,
    // since otherwise the only time we redirect to this page is if they already
    // have a mapping.
    // We just ignore the Discord ID and log them in directly. If they want to
    // link a Discord account, they can do so from the AoC Discord bot.
    session.set("user_id", temporary_user_id);
    session.unset("temporary_user_id");

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (existing_discord_id !== discord_id) {
    session.flash("error", "You've used the wrong Discord account.");
    session.unset("temporary_user_id");
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.set("user_id", temporary_user_id);
  session.unset("temporary_user_id");

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
