import { data, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { getUserByAoCId, createUser } from "../sqlite.server";
import { getSession, commitSession } from "../sessions";

export default function LoginForm() {
  const { error } = useLoaderData<typeof loader>();
  return (
    <div>
      {error && <p>{error}</p>}
      <Form method="post">
        <input type="text" name="aoc_id" placeholder="AoC ID" className="text-black" />
        <button type="submit">Access Shop</button>
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
