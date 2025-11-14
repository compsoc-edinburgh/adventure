# Original Source:
# Advent of code leaderboard notifier (MIT, Dec 2020, tofran)
# https://github.com/tofran/advent-of-code-leaderboard-notifier
#
#
# Modifications by Yuto Takano under MIT license:
#   Add type hints, inlined short functions, integrated with tanjun
#   Rewrite to read from existing JSON fetched elsewhere by another script
#   Rewrite to move from tanjun to crescent
#
import json
import os
from datetime import date, datetime
from typing import Any, Optional, Set, Tuple
import typing

import hikari
import crescent

from aoc_bot.__main__ import Model
from crescent.ext import tasks

plugin = crescent.Plugin[hikari.GatewayBot, Model]()


def get_default_year() -> int:
    """Get the current year.

    Returns
    -------
    int
        The common calendar year in 4 digits.
    """
    today = date.today()

    # Return previous year if we're not in Nov or December
    if today.month != 11 and today.month != 12:
        return today.year - 1

    return today.year


def retrieve_last_leaderboard(dir: str, cache_filename: str) -> Any:
    """Retrieve the last processed leaderboard data (combined).

    Parameters
    ----------
    dir : str
        The directory to look in.
    cache_filename : str
        The filename of the cache file.

    Returns
    -------
    Any
        Loaded AoC dict, probably with a "members" field
    """
    try:
        with open(os.path.join(dir, cache_filename)) as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def retrieve_leaderboard(dir: str, filename: str) -> Any:
    """Retrieve the latest leaderboard JSON from disk.

    Parameters
    ----------
    dir : str
        Directory to search files in.
    filename : str
        Filename which has all the star data combined.

    Returns
    -------
    Any
        The combined parsed JSON response from AoC.
    """
    try:
        with open(os.path.join(dir, filename), "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def save_as_last_processed(
    dir: str, cache_filename: str, data: Any, backup: bool = False
) -> None:
    """Save the leadeboard JSON to disk, overwriting the last processed one.

    Parameters
    ----------
    dir: str
        Directory to save the cache file to.
    filename: str
        Filename of the cache file.
    data : Any
        The JSON to cache as the last processed data.
    backup : bool
        Set to True to keep a copy of the last processed JSON before overwriting.
    """
    filename = os.path.join(dir, cache_filename)
    if backup:
        os.replace(
            filename,
            filename + datetime.now().strftime("%Y%m%d.%H.%M.%S.cachebackup"),
        )
    with open(filename, "w+") as f:
        json.dump(
            data,
            f,
            indent=2,  # Pretty-print it for easy of debugging
        )


def get_leaderboard_set(
    leaderboard: Any, require_both: bool = True
) -> Set[Tuple[str, str, str]]:
    """Create the set of member-day-part tuples for completions.

    Parameters
    ----------
    leaderboard : Any
        The parsed leaderboard JSON.
    require_both : bool
        Whether to return only tuples where the member completed both challenges
        for a given day. Defaults to True. If this is False, event notifications
        for both Part 1 and Part 2 completions will be sent. If this is True,
        notifications will only be sent on Part 2 completion

    Returns
    -------
    Set[Tuple[str, str, str]]
        A tuple of the AoC member ID, day number, and completion part.
    """
    return set(
        (member_id, day, part)
        for member_id, member in leaderboard.get("members", {}).items()
        for day, exercises in member.get("completion_day_level", {}).items()
        for part in exercises.keys()
        if (require_both and part == "2") or not require_both
    )


async def send_webhook_notification(
    bot: hikari.GatewayBot,
    content: str,
    webhook_id: int,
    webhook_token: str,
    max_content_len: int = 2000,
):
    """Execute the webhook with the sepcified content.

    Parameters
    ----------
    bot : hikari.GatewayBot
        The active bot used for getting the endpoint.
    content : str
        The content of the webhook message.
    webhook_id : int
        The Snowflake ID for the webhook. This is the short numerical part in a
        wehook URL.
    webhook_token : str
        The token for the webhook. This is the long final bit in a webhook URL.
    max_content_len : int, optional
        The maximum content length to error out by, by default 2000
    """
    if len(content) > max_content_len:
        # We arbitrarily cut the output to a three-times smaller size, since
        # filling all 2000 characters looks really spammy even if the rest is
        # truncated.
        content = content[: (max_content_len // 3)] + "... and more updates."

    await bot.rest.execute_webhook(
        webhook=webhook_id,
        token=webhook_token,
        username="CompSoc AoC",
        avatar_url="https://i.imgur.com/LDnEjzh.png",
        mentions_everyone=False,
        user_mentions=False,
        role_mentions=False,
        content=content,
    )


def display_aoc_user(
    mapping_file: str,
    aoc_user: Any,
    discord_members: typing.Mapping[hikari.Snowflake, hikari.Member],
) -> str:
    """Pretty-print an AoC User object in the parsed API response. If the user
    has a Discord account linked and they are in the server member list provided
    as an argument, mention them. Otherwise, display their AoC username.

    Parameters
    ----------
    mapping_file : str
        The path to the username mapping file, containing JSON keyed by AoC user
        id.
    aoc_user : Any
        The AoC User object in the parsed API response, where some notable keys
        include "name", "id", "completion_day_level", and "last_star_ts".
    discord_members : typing.Mapping[hikari.Snowflake, hikari.Member]
        The mapping of Discord user IDs to Member objects.

    Returns
    -------
    str
        A pretty-printed Discord-ready AoC user tag.
    """
    try:
        with open(mapping_file, "r") as f:
            mapping: dict[str, str] = json.load(f)

        # Only mention the user if they are in the server, since otherwise it'll
        # appear as @unknown-user, which is worse than the fallback case.
        if hikari.Snowflake(int(mapping[str(aoc_user["id"])])) not in discord_members:
            raise KeyError

        return f"<@{mapping[str(aoc_user['id'])]}>"

    except (KeyError, FileNotFoundError, json.decoder.JSONDecodeError):
        return aoc_user.get("name", None) or f"Anonymous User #{aoc_user['id']}"


def solved_all_days(events: Set[Tuple[str, str, str]], member_id: str) -> bool:
    """Returns true if a given member has solved all 25 Part 2 problems for a
    given event list generated from get_leaderboard_set().

    Parameters
    ----------
    events : Set[Tuple[str, str, str]]
        The event list generated from get_leaderboard_set()
    member_id : str
        The AoC member to check for

    Returns
    -------
    bool
        True if the user has solved all 50 challenges, False otherwise.
    """
    return all(
        any(
            [
                True
                for event in events
                if event[0] == member_id and event[1] == str(day) and event[2] == "2"
            ]
        )
        for day in range(1, 26)
    )


def display_final_message(
    mapping_file: str,
    member_id: str,
    role_id: Optional[int],
) -> str:
    """Pretty-print a final message upon completing all 25 days and 50 challenges.
    If the user has a Discord account linked, show that they are eligible for
    a role. If they are not linked, suggest that it's not too late for them to
    do so now.

    Parameters
    ----------
    mapping_file : str
        The path to the username mapping file, containing JSON keyed by AoC user
        id.
    member_id : str
        The AoC member to send the message for

    Returns
    -------
    str
        The congratulatory message.
    """
    year = get_default_year()

    string = f"🎉 **Congrats on completing all 25 days of AoC {year}!** "

    if role_id:
        try:
            with open(mapping_file, "r") as f:
                mapping: dict[str, str] = json.load(f)
                assert member_id in mapping
                string += f"As a reward, you get the <@&{str(role_id)}> role until the end of January!"

        except (
            AssertionError,
            KeyError,
            FileNotFoundError,
            json.decoder.JSONDecodeError,
        ):
            # If a user links their AoC account after completing all 25 days,
            # they will automatically get the role. See link_command.py.
            string += "If you want to receive a coloured name as a reward, link your AoC account with `/link_aoc`!"

    return string


async def give_role(
    bot: hikari.GatewayBot,
    guild_id: int,
    mapping_file: str,
    member_id: str,
    role_id: int,
):
    """Give the role specified by the snowflake ID to a potential Discord user
    linked by the AoC member ID and a mapping file.

    Parameters
    ----------
    bot : hikari.GatewayBot
        The bot to perform the REST operations from
    guild_id : str
        The guild where the role should be given in
    mapping_file : str
        The path to the username mapping file
    member_id : str
        The AoC member ID to query for.
    role_id : str
        The Discord snowflake for the role to give. Must exist in the guild
        specified by guild_id.
    """
    try:
        with open(mapping_file, "r") as f:
            mapping: dict[str, str] = json.load(f)
            assert member_id in mapping
            await bot.rest.add_role_to_member(
                guild=guild_id,
                user=int(mapping[member_id]),
                role=role_id,
                reason="Completion of AoC!",
            )
    except hikari.ForbiddenError:
        print("Lacking permission to update roles")
    finally:
        return


@plugin.include
@tasks.cronjob("*/15 * * * *")
async def on_schedule() -> None:
    old_leaderboard = retrieve_last_leaderboard(
        dir=plugin.model.star_data_dir, cache_filename=plugin.model.star_data_cache
    )
    new_leaderboard = retrieve_leaderboard(
        dir=plugin.model.star_data_dir,
        filename=plugin.model.star_data_input,
    )

    old_events = get_leaderboard_set(
        old_leaderboard, require_both=plugin.model.require_both_stars
    )
    new_events = get_leaderboard_set(
        new_leaderboard, require_both=plugin.model.require_both_stars
    )

    # Get the interesting diff, which only takes into account relevant parameters
    diff = sorted(new_events - old_events)

    if not diff:
        # Either no change, or negative change.
        save_as_last_processed(
            dir=plugin.model.star_data_dir,
            cache_filename=plugin.model.star_data_cache,
            data=new_leaderboard,
            # Back up on negative changes. The only case I can think of that can
            # make this happen is when the year changes and we might lose data.
            backup=old_events != new_events,
        )
        return

    # Get all Discord users in the guild
    guild = await plugin.app.rest.fetch_guild(plugin.model.slash_guild_id)
    members = guild.get_members()

    # Accumlate all messages for updates at this check. There can be multiple
    # people!
    messages: list[str] = []
    for member_id, day, part in diff:
        message = "[{}] {} solved Day #{}.".format(
            "★★" if part == "2" else "★　",  # fullwidth space to align
            display_aoc_user(
                mapping_file=plugin.model.mapping_file,
                aoc_user=new_leaderboard["members"][member_id],
                discord_members=members,
            ),
            day,
        )

        # If the person solved all 25 days and 50 challenges, add a new congratulatory
        # line and give them a role based on the config.
        if solved_all_days(new_events, member_id):
            message += "\n" + display_final_message(
                mapping_file=plugin.model.mapping_file,
                member_id=member_id,
                role_id=plugin.model.completion_role,
            )
            if plugin.model.completion_role:
                await give_role(
                    bot=plugin.app,
                    guild_id=plugin.model.slash_guild_id,
                    mapping_file=plugin.model.mapping_file,
                    member_id=member_id,
                    role_id=plugin.model.completion_role,
                )
        messages.append(message)

    await send_webhook_notification(
        bot=plugin.app,
        content="\n".join(messages),
        webhook_id=plugin.model.webhook_id,
        webhook_token=plugin.model.webhook_token,
    )

    save_as_last_processed(
        dir=plugin.model.star_data_dir,
        cache_filename=plugin.model.star_data_cache,
        data=new_leaderboard,
    )
