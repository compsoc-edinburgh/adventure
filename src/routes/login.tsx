import { data, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { getUserByAoCId, createUser } from "../sqlite.server";
import { getSession, commitSession } from "../sessions";

export default function LoginForm() {
  const { error } = useLoaderData<typeof loader>();
  return (
    <div className="flex items-center justify-center w-full flex-col">
      <h2 className="text-3xl font-display mb-6">Login</h2>
      <span className="text-sm opacity-75">Please enter your AoC ID to access the reward exchange shop.</span>
      {error && <p>{error}</p>}
      <Form method="post" className="mt-6">

        <div className="min-w-64">
          <label htmlFor="aoc_id" className="block mb-2 text-sm text-christmasDark">AoC ID Number</label>
          <input type="text" name="aoc_id" placeholder="e.g. 1234512" id="aoc_id" className="bg-gray-50 border border-christmasBeigeAccent  text-sm rounded-lg focus:outline-double focus:outline-4 focus:outline-christmasRed box-border block w-72 p-3" required />
        </div>
        <button type="submit" className="block relative w-full mt-3 px-6 py-2 rounded-lg bg-christmasRed text-white active:scale-95 transition-all duration-75 focus:outline-4 focus:outline-christmasRed focus:outline-double">Access Shop</button>
      </Form>
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

  // Check if the user exists
  let user = getUserByAoCId(parseInt(aoc_id));
  if (!user) {
    // Create the user
    user = createUser(parseInt(aoc_id));
    if (!user) {
      session.flash("error", "Invalid username/password");

      return redirect("/login", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  }

  session.set("user_id", user.id.toString());

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
