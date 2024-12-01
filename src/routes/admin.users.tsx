import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, redirect, useLoaderData } from "@remix-run/react";
import { requireUserSession } from "../sessions";
import { getUserById, getUsers } from "../sqlite.server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/Table";

export default function Users() {
  const { users } = useLoaderData<typeof loader>();
  return (
    <>
      <h2 className="text-2xl font-display mb-3">Users</h2>
      <Table className="bg-white">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>AoC ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Physically in Edinburgh</TableHead>
            <TableHead>Is Admin</TableHead>
            <TableHead>Stars</TableHead>
            <TableHead>Registered At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell><Link to={`/admin/users/${user.id}`}>{user.id}</Link></TableCell>
              <TableCell>{user.aoc_id}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.is_physically_in_edinburgh ? "Yes" : "No"}</TableCell>
              <TableCell>{user.is_admin ? "Yes" : "No"}</TableCell>
              <TableCell>{user.gained_stars}</TableCell>
              <TableCell>{user.registered_at}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
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

  const users = getUsers();

  return { users };
}
