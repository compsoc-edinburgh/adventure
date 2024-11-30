import UserLogin from "../components/user_login";

export default function Index() {
  return (
    <div>
      <h1 className="text-8xl font-display bg-clip-text text-transparent bg-gradient-to-t from-white to-green-50">Advent of Code</h1>
      <UserLogin />
    </div>
  );
}
