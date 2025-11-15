import json
import os
import threading

import hikari
import crescent

from aoc_bot.__main__ import Model
import aoc_bot.modules.leaderboard as leaderboard

plugin = crescent.Plugin[hikari.GatewayBot, Model]()

username_db_lock = threading.Lock()

# This module provides slash commands for linking and unliking Discord IDs with
# Advent of Code User IDs. Linking isn't really beneficial right now except to
# show your name in notifications.
# e.g. "User #123 submitted!" vs "<@kilolympus> submitted!"
# Pings are disabled anyway, so this is a purely cosmetic aspect.


def get_aoc_name_from_aoc_id(aoc_id: int):
    """
    Attempt to retrieve the cached leaderboard and get the AoC display name.
    We must use the "last processed" data, not the most fresh data, since
    otherwise we will double-notify when the cron runs next time.
    """
    cached_leaderboard = leaderboard.retrieve_last_leaderboard(
        dir=plugin.model.data_dir,
        cache_filename=plugin.model.star_data_cache,
    )

    aoc_username = f"Anonymous User"
    if (
        "members" in cached_leaderboard
        and str(aoc_id) in cached_leaderboard["members"]
        and "name" in cached_leaderboard["members"][str(aoc_id)]
    ):
        # If the user has a name, specify it for the notification, just
        # so they can double-check.
        aoc_username = cached_leaderboard["members"][str(aoc_id)]["name"]

    return aoc_username


def read_mapping_file(mapping_file: str) -> dict[int, int]:
    """
    Read the AoC ID to Discord ID mapping file. The file is stored as mapping
    of string to string because JSON doesn't support integer keys. For
    convenience, this function converts both keys and values into integers.

    Parameters
    ----------
    mapping_file : str
        File to open and read.

    Returns
    -------
    dict[int, int]
        AoC ID keys to Discord ID values.
    """
    mapping: dict[int, int]
    try:
        with open(mapping_file, "r") as f:
            tmp: dict[str, str] = json.load(f)
            mapping = {int(k): int(v) for k, v in tmp.items()}
    except FileNotFoundError:
        # If ia file is not found on open, proceed with empty and try to
        # create it later.
        mapping = {}

    return mapping


def write_mapping_file(mapping_file: str, mapping: dict[int, int]):
    """Write the mapping data to JSON. Since JSON doesn't support integer keys,
    we convert IDs to string. Values could technically stay int if needed, but
    for consistency we also convert those to string.

    Parameters
    ----------
    mapping_file : str
        File to open and write.
    mapping : dict[int, int]
        AoC ID keys to Discord ID values.
    """
    with open(mapping_file, "w") as f:
        tmp = {str(k): str(v) for k, v in mapping.items()}
        json.dump(
            tmp,
            f,
            indent=2,  # Pretty-print it for easy of debugging
        )


@plugin.include
@crescent.command(
    name="link_aoc",
    description="Link your Advent of Code account to your Discord account",
)
class LinkCommand:
    aoc_id = crescent.option(int, name="aoc_id", description="AoC User ID")

    async def callback(self, ctx: crescent.Context) -> None:
        mapping_file = os.path.join(plugin.model.data_dir, plugin.model.mapping_file)
        # Make sure no other threads modify content by acquiring a mutex
        # This is especially important since we separate the read and write operations.
        # There is no sufficient mode to open the file and do both reading (from
        # the top), writing (overwriting existing content), and creation if the file
        # doesn't exist.
        with username_db_lock:
            try:
                mapping = read_mapping_file(mapping_file)
            except json.decoder.JSONDecodeError as e:
                # Failing to read a JSON could lead to data loss, so don't proceed.
                print(f"Failed link_command (read): {e}")
                await ctx.respond(
                    "Failed to link! Logs printed to console.", ephemeral=True
                )
                return

            aoc_username = get_aoc_name_from_aoc_id(self.aoc_id)
            for k, v in mapping.items():
                if k == self.aoc_id and v == ctx.user.id:
                    await ctx.respond(
                        "You have already linked this AoC ID previously. Don't worry!",
                        ephemeral=True,
                    )
                    return
                # Prevent one Discord user mapping to multiple AoC ID
                if v == ctx.user.id:
                    aoc_username = get_aoc_name_from_aoc_id(k)
                    await ctx.respond(
                        f"You seem to already be linked to a different AoC User ID: {str(k)} ({aoc_username}). Please use `/unlink_aoc` before trying to link again.",
                        ephemeral=True,
                    )
                    return

                # Prevent one AoC ID being mapped to different Discord users
                if k == self.aoc_id:
                    await ctx.respond(
                        f"AoC User ID {str(k)} ({aoc_username}) seems to already be linked to someone else: <@{str(v)}>. They must run `/unlink_aoc` before you can link your own.",
                        ephemeral=True,
                    )

            mapping[self.aoc_id] = ctx.user.id

            try:
                # Attempt to retrieve the last processed leaderboard, so we can
                # check if they've completed all 12 days so we can reward them.
                cached_leaderboard = leaderboard.retrieve_last_leaderboard(
                    dir=plugin.model.data_dir,
                    cache_filename=plugin.model.star_data_cache,
                )

                write_mapping_file(mapping_file, mapping)
                await ctx.respond(
                    f"Linked {ctx.user.username} with AoC User ID {str(self.aoc_id)} ({aoc_username})!",
                    ephemeral=True,
                )

                # Now check if they have completed 12 days, 24 challenges
                # We can use the cached leaderboard, since if they issued /link
                # it's pretty much guaranteed their data's already been fetched
                # before. If it's not registered complete yet, it'll be triggered in
                # the next update anyway.
                events = leaderboard.get_leaderboard_set(
                    cached_leaderboard,
                    require_both=plugin.model.require_both_stars,
                )
                if leaderboard.solved_all_days(events, str(self.aoc_id)):
                    # Hide user ID at least on the public notification, but still
                    # include the username since the final message itself doesn't
                    # contain any identifying information.
                    await leaderboard.send_webhook_notification(
                        plugin.app,
                        f"{ctx.user.mention} linked their account.\n{leaderboard.display_final_message(mapping_file, str(self.aoc_id), plugin.model.completion_role)}",
                        webhook_id=plugin.model.webhook_id,
                        webhook_token=plugin.model.webhook_token,
                    )
                    await leaderboard.give_role(
                        bot=plugin.app,
                        guild_id=plugin.model.slash_guild_id,
                        mapping_file=plugin.model.mapping_file,
                        member_id=str(self.aoc_id),
                        role_id=plugin.model.completion_role,
                    )

            except FileNotFoundError as e:
                # Either parent directory doesn't exist or no write perms?
                print(f"Failed link_command (write): {e}")
                await ctx.respond(
                    "Failed to link! Logs printed to console.", ephemeral=True
                )


@plugin.include
@crescent.command(
    name="unlink_aoc",
    description="Unlink any Advent of Code account attached to your Discord account",
)
class UnlinkCommand:
    async def callback(self, ctx: crescent.Context) -> None:
        mapping_file = os.path.join(plugin.model.data_dir, plugin.model.mapping_file)

        # Make sure no other threads are writing by acquiring a mutex

        with username_db_lock:
            try:
                mapping = read_mapping_file(mapping_file)
            except json.decoder.JSONDecodeError as e:
                # Failing to read a JSON could lead to data loss, so don't proceed.
                print(f"Failed link_command (read): {e}")
                await ctx.respond(
                    "Failed to link! Logs printed to console.", ephemeral=True
                )
                return

            for aoc_id, discord_id in mapping.items():
                if discord_id == ctx.user.id:
                    mapping.pop(aoc_id)
                    break
            else:
                await ctx.respond(
                    "Your account wasn't linked in the first place!", ephemeral=True
                )
                # If there were no link, no need to write to file again
                return

            try:
                # Attempt to retrieve the cached leaderboard, so we can check if
                # the user has a name on AoC.
                aoc_username = get_aoc_name_from_aoc_id(aoc_id)

                write_mapping_file(mapping_file, mapping)
                await ctx.respond(
                    f"Unlinked {ctx.user.username} from AoC User ID {str(aoc_id)} ({aoc_username})!",
                    ephemeral=True,
                )

            except FileNotFoundError as e:
                # Either parent directory doesn't exist or no write perms
                print(f"Failed unlink_command (write): {e}")
                await ctx.respond(
                    "Failed to unlink! Logs printed to console.", ephemeral=True
                )
