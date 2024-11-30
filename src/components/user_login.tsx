import { Form, Link } from "@remix-run/react";
import type { FunctionComponent } from "react";

type UserLoginProps = {
  aoc_id?: number;
};

const UserLogin: FunctionComponent<UserLoginProps> = ({ aoc_id }) => {
  return (
    <div>
      {aoc_id === undefined
        ? <Link to="/login">Login</Link>
        : (
            <>
              <span>
                Hi
                {aoc_id}
                !
              </span>

              <Form action="logout" method="post">
                <button type="submit">Logout</button>
              </Form>
            </>
          )}
    </div>
  );
};

export default UserLogin;
