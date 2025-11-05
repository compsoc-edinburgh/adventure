import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "react-router";
import { getSession, destroySession } from "../sessions";

export async function loader(args: LoaderFunctionArgs) {
  return action(args);
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );

  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
