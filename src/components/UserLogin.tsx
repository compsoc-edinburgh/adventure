import { Form, Link } from "react-router";
import type { FunctionComponent } from "react";
import { User } from "src/sqlite.server";

type UserLoginProps = {
  className?: string;
  user?: User;
  aoc_name?: string;
};

const UserLogin: FunctionComponent<UserLoginProps> = ({ className, user, aoc_name }) => {
  return (
    <div className={`${className}`}>
      {user?.aoc_id === undefined
        ? <Link to="/login" className="block relative m-2 px-6 py-2 rounded-lg bg-christmasRed text-white active:scale-95 transition-all duration-75 focus:outline-4 focus:outline-christmasRed focus:outline-double">Login</Link>
        : (
            <div className="flex flex-row items-center">
              <span>
                {aoc_name || `AoC#${user.aoc_id}`}
              </span>
              <Form action="logout" method="post">
                <button type="submit" className="block relative m-2 px-6 py-2 rounded-lg bg-christmasBeigeAccent text-christmasGreen active:scale-95 transition-all duration-75 focus:outline-4 focus:outline-christmasGreen focus:outline-double">Logout</button>
              </Form>
            </div>
          )}
    </div>
  );
};

export default UserLogin;
