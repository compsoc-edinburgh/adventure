import { LoaderFunctionArgs, Link, redirect, useLoaderData } from "react-router";
import { requireUserSession } from "../sessions";
import { getUserById, getUsers, User } from "../sqlite.server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/Table";
import { getStarForAllUsers } from "../stars.server";
import { Button } from "../components/Button";

export default function Users() {
  const { users } = useLoaderData<typeof loader>();
  return (
    <>
      <h2 className="text-2xl font-display mb-3">Users</h2>
      <div className="flex gap-2 w-full justify-end items-center mb-2">
        <Button component="a" href="/admin/download?type=users" className="px-4 py-1" bg="beige">Download as CSV</Button>
      </div>
      <Table className="bg-white">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>AoC ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Physically in Edinburgh</TableHead>
            <TableHead>Is Admin</TableHead>
            <TableHead>Last Synced Stars</TableHead>
            <TableHead>AoC Raw Stars</TableHead>
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
              <TableCell>{user.raw_stars}</TableCell>
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

  const users = getUsers() as (User & { raw_stars: number })[];

  // The users table has the star count of each user, but that is only updated
  // when the users visit the site and login. To get the most up-to-date star
  // count, we read it from the AoC API data.
  // We don't want to slow down the page load any further so we won't update the
  // database with any new star counts though, it's just for display purposes.
  const stars = getStarForAllUsers();

  for (const user of users) {
    if (user.aoc_id) {
      user.raw_stars = stars[user.aoc_id] || 0;
    }
  }

  return { users };
}
