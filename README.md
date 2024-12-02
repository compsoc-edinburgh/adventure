# Adventure

Advent of Code Rewards Platform for CompSoc Edinburgh.

## Running

Adventure comes as a Docker image on `ghcr.io`. The recommended tag is `ghcr.io/compsoc-edinburgh/service-adventure:latest`.

The following environment variables need to be set for a successful run:

| Environment Variable | Explanation |
|---|---|
| ADMIN_LOGIN | A long complex passstring to be used for the Admin to log in |
| COMPSOC_LEADERBOARD_JOIN_CODE | The join code for the CompSoc leaderboard, used for the Help screen |
| CCSIG_LEADERBOARD_JOIN_CODE | The join code for the CCSig leaderboard, used for the Help screen |
| OAUTH_DISCORD_CLIENT_ID | The Discord client ID with "identify" scope |
| OAUTH_DISCORD_REDIRECT_URI | The Discord redirect URL, must be approved on Discord Developers Console prior to use |

In addition, the following files must be made available through a volume mapping:

| File in Container | Explanation |
|---|---|
| `data/discord_mapping.json` | A JSON mapping of from AoC ID to Discord ID (`dict[str, str]`) |
| `data/aoc_data.json` | The AoC JSON API data for the CompSoc leaderboard |
| `data/aoc_ccsig_data.json` | The AoC JSON API data for the CCSig leaderboard |

The mapping file can be a hardlink to the mapping file generated by the [`aoc-bot`](https://github.com/compsoc-edinburgh/aoc-bot).

The latter two AoC JSON API data must be updated every 15 minutes, e.g. through a cronjob on the host system. They can just be the output of cURL to the leaderboard JSON endpoint piped to a file.

## Example docker-compose file

```yaml
version: "3"
services:
  aoc-eshop:
    image: ghcr.io/compsoc-edinburgh/service-adventure:latest
    container_name: adventure
    ports:
      - 58745:3000
    environment:
      - ADMIN_LOGIN=mysecretadminlogin
      - SESSION_SECRET=somesessioncookiesecret
      - LEADERBOARD_JOIN_CODE=123123-123123
      - CCSIG_LEADERBOARD_JOIN_CODE=124124-124124
      - OAUTH_DISCORD_CLIENT_ID=77101010101010
      - OAUTH_DISCORD_REDIRECT_URL=https://localhost:58745/login/discord
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```
