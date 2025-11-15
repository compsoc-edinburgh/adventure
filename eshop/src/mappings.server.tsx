import * as fs from "fs";
import path from "path";
import { env } from "process";

// Files containing the API response from AoC. These are split into several
// since each leaderboard can only contain 200 members. There may be duplicate
// members in each file, but they should contain the same info if so.
const mapping_file = path.join(env.ABS_DATA_DIR as string, "discord_mapping.json");

export function getDiscordIdFromAocId(aoc_user_id: number): number | null {
  const data = JSON.parse(fs.readFileSync(mapping_file, "utf-8"));
  return data[aoc_user_id.toString()] || null;
}
