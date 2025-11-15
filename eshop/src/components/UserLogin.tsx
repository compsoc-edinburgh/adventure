import { Form, Link } from "react-router";
import type { FunctionComponent } from "react";
import { User } from "src/sqlite.server";
import { Button } from "./Button";

type UserLoginProps = {
  className?: string;
  user?: User;
  aoc_name?: string;
};

const UserLogin: FunctionComponent<UserLoginProps> = ({ className, user, aoc_name }) => {
  return (
    <div className={`${className}`}>
      {user?.aoc_id === undefined
        ? <Button component={Link} to="/login" bg="red" className="m-2 px-6 py-2 ">Login</Button>
        : (
            <div className="flex flex-row items-center gap-2 m-2">
              <span>
                {aoc_name || `AoC#${user.aoc_id}`}
              </span>
              {user.is_admin && <Button component={Link} to="/admin" bg="red" className="py-2 px-6">Admin View</Button>}
              <Form action="logout" method="post">
                <Button type="submit" bg="beige" className="py-2 px-6">Logout</Button>
              </Form>
            </div>
          )}
    </div>
  );
};

export default UserLogin;
