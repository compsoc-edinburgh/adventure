#!/bin/sh
# shellcheck shell=dash
set -euo pipefail

if [ -z "${AOC_SESSION_ID-}" ]; then
  echo "AOC_SESSION_ID must be provided to fetch API data from AdventOfCode.com."
  echo "You can find this in your browser's cookie list."
  exit 1
fi


if [ -z "${AOC_LEADERBOARD_IDS-}" ]; then
  echo "AOC_LEADERBOARD_IDS must be provided."
  echo "You can specify multiple IDs using commas to separate each one."
  exit 1
fi

if [ -z "${DATA_DIR-}" ]; then
  echo "DATA_DIR must be provided."
fi

if [ -z "${YEAR-}" ]; then
  month=$(date +"%m")
  if [ "$month" -ne 11 ] && [ "$month" -ne 12 ]; then
    YEAR=$(($(date +"%Y") - 1))
  else
    YEAR=$(date +"%Y")
  fi
fi

echo "${AOC_LEADERBOARD_IDS}" | sed s/,/\\n/g | while read -r LEADERBOARD_ID
do
  # --silent to hide the progress bar to not pollute logs since it runs often
  # --fail to not write to output file if response has a bad HTTP status code
  curl --fail --silent --cookie "session=${AOC_SESSION_ID}" -H "Accept: application/json" -L "https://adventofcode.com/${YEAR}/leaderboard/private/view/${LEADERBOARD_ID}.json" -o "${DATA_DIR}/aoc_star_data_${LEADERBOARD_ID}.json"
done
