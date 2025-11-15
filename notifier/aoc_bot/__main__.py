import argparse
import dataclasses

import hikari
import crescent

parser = argparse.ArgumentParser()
parser.add_argument(
    "--star-data-dir",
    required=True,
    help="The directory where the --star-file-ingest-regex argument will be used to scan all direct child files.",
)
parser.add_argument(
    "--star-data-input",
    required=True,
    help="Filename to read the latest star data from. Expected fields are '.members'. Must be a direct child of the directory specified in --star-data-dir.",
)
parser.add_argument(
    "--star-data-cache",
    required=False,
    default="lastprocessed.json",
    help="Filename to write the last processed star data cache to. Must have read-write access. Must be a direct child of the directory specified in --star-data-dir.",
)
parser.add_argument(
    "--mapping-file",
    required=True,
    help="The path to a .json file which will be written to and read from for the username mapping. Must have read-write access. Must be a direct child of the directory specified in --star-data-dir.",
)
parser.add_argument(
    "--slash-guild-id",
    required=True,
    type=int,
    help="Guild ID where slash command should show up. This bot does not support global slash commands.",
)
parser.add_argument(
    "--webhook-id",
    required=True,
    type=int,
    help="The destination Discord webhook id (the snowflake in the webhook URL).",
)
parser.add_argument(
    "--webhook-token",
    required=True,
    help="The destination Discord webhook token (the last component of the webhook URL)",
)
parser.add_argument(
    "--discord-token",
    required=True,
    help="The token for the Discord bot to respond to slash commands.",
)
parser.add_argument(
    "--require-both-stars",
    action="store_true",
    help="If set, will only notify when users achieve both stars. Otherwise will notify for each one.",
)
parser.add_argument(
    "--completion-role",
    required=False,
    type=int,
    help="The green role to give upon completion. This role snowflake ID has to exist in the guild specified with --slash-guild-id.",
)


# Used for Dependency Injection of CLI args, i.e. sharing state across all extensions
@dataclasses.dataclass
class Model:
    star_data_dir: str
    star_data_input: str
    star_data_cache: str
    mapping_file: str
    slash_guild_id: int
    webhook_id: int
    webhook_token: str
    discord_token: str
    require_both_stars: bool
    completion_role: int


def main():
    args = parser.parse_args()
    bot = hikari.GatewayBot(
        token=args.discord_token,
        intents=hikari.Intents.ALL_UNPRIVILEGED | hikari.Intents.GUILD_MEMBERS,
    )
    client = crescent.Client(bot, Model(**args.__dict__))

    client.plugins.load_folder("aoc_bot.modules")

    bot.run()


if __name__ == "__main__":
    main()
