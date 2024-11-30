import { Link } from "@remix-run/react";
import type { FunctionComponent } from "react";

type UserLoginProps = {
  name?: string;
  aoc_id?: number;
};

const UserLogin: FunctionComponent<UserLoginProps> = ({ name }) => {
  return (
    <div>
      {name === undefined
        ? <Link to="/login">Login</Link>
        : (
            <span>
              Hi
              {name}
              !
            </span>
          )}
    </div>
  );
};

export default UserLogin;
