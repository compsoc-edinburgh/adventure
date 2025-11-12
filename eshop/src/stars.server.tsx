import * as fs from "fs";
import path from "path";
import { env } from "process";

// Files containing the combined API response from AoC. This is a result of
// merging multiple leaderboard files (since each one has a maximum of 200
// participants and it accumulates over the years). Note that the only field
// guaranteed to exist in the merged file is "members"
const leaderboard_file = path.join(env.ABS_DATA_DIR || "/", "aoc_star_data.json");

export function getStarsForUser(aoc_user_id: number): number {
  const data = JSON.parse(fs.readFileSync(leaderboard_file, "utf-8"));
  if (data.members[aoc_user_id.toString()]) {
    return data.members[aoc_user_id.toString()].stars;
  }
  return 0;
}

export function getStarForAllUsers(): { [key: string]: number } {
  let stars: { [key: string]: number } = {};
  const data = JSON.parse(fs.readFileSync(leaderboard_file, "utf-8"));
  for (const user in data.members) {
    // Ignore duplicate users in different files
    if (!stars[user]) {
      stars[user] = data.members[user].stars;
    }
  }
  return stars;
}

export function isUserInLeaderboard(aoc_user_id: number): boolean {
  const data = JSON.parse(fs.readFileSync(leaderboard_file, "utf-8"));
  if (data.members[aoc_user_id.toString()]) {
    return true;
  }
  return false;
}

export function getNameForUser(aoc_user_id: number): string {
  const data = JSON.parse(fs.readFileSync(leaderboard_file, "utf-8"));
  if (data.members[aoc_user_id.toString()]) {
    return data.members[aoc_user_id.toString()].name;
  }
  return "Anonymous User #" + aoc_user_id;
}
