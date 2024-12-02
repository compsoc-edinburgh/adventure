import { ActionFunctionArgs } from "@remix-run/node";
import { Link, redirect, useFetcher, useLoaderData, useLocation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { AiOutlineDiscord } from "react-icons/ai";
import { commitSession, getSession } from "../sessions";
import { updateUserDiscordId } from "../sqlite.server";

export default function LoginDiscord() {
  const location = useLocation();
  const [hash] = useState(location.hash.slice(1));
  const parsedFragment = new URLSearchParams(hash);
  const [accessToken, tokenType] = [parsedFragment.get("access_token"), parsedFragment.get("token_type")];

  const fetcher = useFetcher<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);

  const [discordId, setDiscordId] = useState<string>("");
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
          setDiscordId(response.id);
          setDiscordUsername(response.username);
          formRef.current?.submit();
        })
        .catch((reason) => {
          setError(String(reason));
        });
    }
  }, [accessToken, tokenType]);

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
      <fetcher.Form method="post" className="hidden" ref={formRef}>
        <input type="text" name="discord_id" value={discordId} readOnly hidden />
        <button type="submit">Submit</button>
      </fetcher.Form>
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

  const formData = await request.formData();
  const discord_id = formData.get("discord_id");

  // Check that the Discord ID and username are not empty.
  if (typeof discord_id !== "string") {
    session.flash("error", "Invalid form data.");
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Update the user's Discord ID and username.
  updateUserDiscordId(parseInt(temporary_user_id), discord_id);

  session.set("user_id", temporary_user_id);
  session.unset("temporary_user_id");

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
