import * as fs from "fs";

// Files containing the API response from AoC. These are split into several
// since each leaderboard can only contain 200 members. There may be duplicate
// members in each file, but they should contain the same info if so.
const MAPPING_FILE = "data/discord_mapping.json";

export function getDiscordIdFromAocId(aoc_user_id: number): number | null {
  const data = JSON.parse(fs.readFileSync(MAPPING_FILE, "utf-8"));
  return data[aoc_user_id.toString()] || null;
}
