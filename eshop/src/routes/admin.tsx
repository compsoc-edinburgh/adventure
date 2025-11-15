import { Link, Outlet, redirect, useNavigation, LoaderFunctionArgs } from "react-router";
import { requireUserSession } from "../sessions";
import { getUserById } from "../sqlite.server";
import { Button } from "../components/Button";

export default function Admin() {
  const navigation = useNavigation();
  return (
    <div className="flex flex-col items-center md:max-w-[70%] m-auto">
      <h1 className="text-3xl font-display mb-3">Admin Page</h1>
      <div className="flex flex-row gap-3 mb-6">
        <Button component={Link} to="/admin/users" bg="green" className="px-6 py-2">Users</Button>
        <Button component={Link} to="/admin/items" bg="green" className="px-6 py-2">Items</Button>
        <Button component={Link} to="/admin/transactions" bg="green" className="px-6 py-2">Transactions</Button>
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
