import { data, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import { getUserByAoCId, createUser } from "../sqlite.server";
import { getSession, commitSession } from "../sessions";
import { isUserInLeaderboard } from "../stars.server";

export default function LoginForm() {
  const { error } = useLoaderData<typeof loader>();
  return (
    <div className="flex items-center justify-center w-full flex-col">
      <h2 className="text-3xl font-display mb-6">Login</h2>
      <span className="text-sm opacity-75">Please enter your AoC ID to access the reward exchange shop.</span>
      <Form method="post" className="mt-6">
        <div className="min-w-64">
          <label htmlFor="aoc_id" className="block mb-2 text-sm text-christmasDark">AoC ID Number</label>
          <input type="text" name="aoc_id" placeholder="e.g. 1234512" id="aoc_id" className="bg-gray-50 border border-christmasBeigeAccent  text-sm rounded-lg focus:outline-double focus:outline-4 focus:outline-christmasRed box-border block w-72 p-3" required />
        </div>
        <button type="submit" className="block relative w-full mt-3 px-6 py-2 rounded-lg bg-christmasRed text-white active:scale-95 transition-all duration-75 focus:outline-4 focus:outline-christmasRed focus:outline-double">Access Shop</button>
        {error && <p className="text-christmasRedAccent text-sm mt-3 min-w-full w-0">{error}</p>}
      </Form>

      <div className="mt-8">
        <Link to="/login/help" className="text-sm opacity-75">Click for Help</Link>
      </div>
    </div>
  );
}

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );

  if (session.has("user_id")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/");
  }

  return data({ error: session.get("error") }, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(
    request.headers.get("Cookie"),
  );

  const formData = await request.formData();
  const aoc_id = formData.get("aoc_id");
  if (typeof aoc_id !== "string") {
    return redirect("/login");
  }

  // Check that the AoC ID is a number
  if (!/^\d+$/.test(aoc_id)) {
    session.flash("error", "The AoC ID is supposed to be a number!");

    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Check if they are in the CompSoc leaderboard
  if (!isUserInLeaderboard(parseInt(aoc_id))) {
    session.flash("error", "You are not in the CompSoc leaderboard! See the Help.");

    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Check if the user exists
  let user = getUserByAoCId(parseInt(aoc_id));
  if (!user) {
    // Prompt for more information from the user
    // Create the user
    user = createUser(parseInt(aoc_id));
    if (!user) {
      session.flash("error", "Could not create a new login entry due to a database error.");

      return redirect("/login/new", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  }

  session.set("user_id", user.id.toString());

  // We deem a user verified when they have checked that they are both in Edinburgh
  // and have an email address.
  let verified = user.is_physically_in_edinburgh && user.email !== null;

  return redirect(verified ? "/" : "/setup", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
