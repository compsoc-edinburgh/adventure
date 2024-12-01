import * as fs from "fs";

// File containing the API response from AoC
const AOC_DATA_FILE = "data/aoc_data.json";

export function getStarsForUser(aoc_user_id: number): number {
  const data = JSON.parse(fs.readFileSync(AOC_DATA_FILE, "utf-8"));
  return data.members[aoc_user_id.toString()]?.stars || 0;
}
