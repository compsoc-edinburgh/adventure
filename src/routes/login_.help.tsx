import { Link, useLoaderData } from "@remix-run/react";
import aoc_id from "../assets/Screenshot 2024-12-01_17-08-36.png";

export default function LoginHelp() {
  const { compsoc_leaderboard_join_code, ccsig_leaderboard_join_code } = useLoaderData<typeof loader>();
  return (
    <div className="flex items-center justify-center w-full flex-col">
      <h2 className="text-3xl font-display mb-6">Help with Logging in</h2>
      <Link to="/login" className="text-sm opacity-75">Click to go back</Link>
      <div className="mt-8 grid grid-cols-3 mx-16 gap-4 items-start">
        <div className="bg-christmasBeigeAccent rounded-lg p-4">
          <h3 className="text-2xl font-display mb-3">What is my AoC ID?</h3>
          <p>
            Your AoC ID is a unique number assigned to you when you register for on the Advent of Code website:
            {" "}
            <a href="https://adventofcode.com" className="text-blue-500">https://adventofcode.com</a>
            .

            You can find it on your Settings page after you log in, like the below image:
            <img className="w-full rounded-md mt-3" src={aoc_id} alt="Find your AoC ID on the Settings page within the AoC website, and it should say next to 'Anonymous User'." />
          </p>
        </div>
        <div className="bg-christmasBeigeAccent rounded-lg p-4">
          <h3 className="text-2xl font-display mb-3">What is the Leaderboard?</h3>
          <p>
            It is necessary to join the 'CompSoc Private Leadeboard' on Advent of Code in order for us to track your progress and sync your stars with this website. Once you've created an account on Advent of Code, you can join the leaderboard through
            {" "}
            <a href="https://adventofcode.com/2024/leaderboard/private" className="text-blue-500">the Leaderboard page</a>
            {" "}
            by using the code:
            <pre className="w-full rounded-md p-2 my-3 bg-gray-200">
              <code>{compsoc_leaderboard_join_code}</code>
            </pre>
            If the above is full, CCSig is also running a verified leaderboard, which you can join with the code:
            <pre className="w-full rounded-md p-2 my-3 bg-gray-200">
              <code>{ccsig_leaderboard_join_code}</code>
            </pre>
          </p>
        </div>
        <div className="bg-christmasBeigeAccent rounded-lg p-4">
          <h3 className="text-2xl font-display mb-3">How secure is this?</h3>
          <p>
            We collect the following information:
            <ul className="list-disc list-inside">
              <li>Your AoC ID - for syncing stars</li>
              <li>Your institutional (Edinburgh) email - for contact</li>
              <li>Whether or not you are physically in Edinburgh - for eligibility</li>
            </ul>
            <br />
            Other than these, we do not store any passwords or other personal information. You can view the source code for this website on GitHub:
            {" "}
            <a href="https://github.com/compsoc-edinburgh/adventure" className="text-blue-500">
              https://github.com/compsoc-edinburgh/adventure
            </a>
            <br />
            <br />
            <b>We ask you kindly to not to try to login with another person's AoC ID, as this service runs on trust and goodwill. You risk this event being cancelled for everyone if you do so.</b>
          </p>
        </div>
      </div>
    </div>
  );
}

export async function loader() {
  return {
    compsoc_leaderboard_join_code: process.env.COMPSOC_LEADERBOARD_JOIN_CODE,
    ccsig_leaderboard_join_code: process.env.CCSIG_LEADERBOARD_JOIN_CODE,
  };
};
