import { Form, Link } from "@remix-run/react";
import type { FunctionComponent } from "react";
import { User } from "src/sqlite.server";

type UserLoginProps = {
  user?: User;
};

const UserLogin: FunctionComponent<UserLoginProps> = ({ user }) => {
  return (
    <div>
      {user?.aoc_id === undefined
        ? <Link to="/login">Login</Link>
        : (
            <>
              <span>
                Hi
                {user.aoc_id}
                !
              </span>
              <br />
              <span>
                Stars:
                {user.gained_stars}
              </span>
              <span>It may take up to 15 minutes for a newly gained star to show up here, due to AoC API limitations.</span>

              <Form action="logout" method="post">
                <button type="submit">Logout</button>
              </Form>
            </>
          )}
    </div>
  );
};

export default UserLogin;
