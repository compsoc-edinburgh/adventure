import * as fs from "fs";

// Files containing the API response from AoC. These are split into several
// since each leaderboard can only contain 200 members. There may be duplicate
// members in each file, but they should contain the same info if so.
const leaderboard_files = [
  "data/aoc_data.json",
  "data/aoc_ccsig_data.json",
];

export function getStarsForUser(aoc_user_id: number): number {
  for (const file of leaderboard_files) {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    if (data.members[aoc_user_id.toString()]) {
      return data.members[aoc_user_id.toString()].stars;
    }
  }
  return 0;
}

export function isUserInLeaderboard(aoc_user_id: number): boolean {
  for (const file of leaderboard_files) {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    if (data.members[aoc_user_id.toString()]) {
      return true;
    }
  }
  return false;
}

export function getNameForUser(aoc_user_id: number): string {
  for (const file of leaderboard_files) {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    if (data.members[aoc_user_id.toString()]) {
      return data.members[aoc_user_id.toString()].name;
    }
  }
  return "Anonymous User #" + aoc_user_id;
}
