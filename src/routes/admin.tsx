import { Link, Outlet, redirect, useNavigation } from "@remix-run/react";
import { requireUserSession } from "../sessions";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getUserById } from "../sqlite.server";

export default function Admin() {
  const navigation = useNavigation();
  return (
    <div className="flex flex-col items-center md:max-w-[70%] m-auto">
      <h1 className="text-3xl font-display mb-3">Admin Page</h1>
      <div className="flex flex-row gap-3 mb-6">
        <Link to="/admin/users" className="bg-christmasGreen rounded-md px-6 py-2 text-white active:scale-95 transition-all duration-75">Users</Link>
        <Link to="/admin/items" className="bg-christmasGreen rounded-md px-6 py-2 text-white active:scale-95 transition-all duration-75">Items</Link>
        <Link to="/admin/transactions" className="bg-christmasGreen rounded-md px-6 py-2 text-white active:scale-95 transition-all duration-75">Transactions</Link>
      </div>
      {navigation.state === "loading"
        ? (
            <p>Loading...</p>
          )
        : <Outlet />}
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireUserSession(request);
  if (!session) {
    return redirect("/login");
  }

  const user = getUserById(parseInt(session.get("user_id")!));
  if (!user || !user.is_admin) {
    return redirect("/");
  }
  return { };
}
