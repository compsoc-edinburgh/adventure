import { LoaderFunctionArgs } from "@remix-run/node";
import UserLogin from "../components/user_login";
import { getSession } from "../sessions";
import { useLoaderData } from "@remix-run/react";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );

  if (session.has("user_id")) {
    const user_id = session.get("user_id");
    return {
      user_id: user_id ? parseInt(user_id) : undefined,
    };
  }

  return {};
}

export default function Index() {
  const { user_id } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1 className="text-8xl font-display bg-clip-text text-transparent bg-gradient-to-t from-white to-green-50">Advent of Code</h1>
      <UserLogin aoc_id={user_id} />
    </div>
  );
}
