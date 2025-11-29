import re
import hikari
import crescent
import hikari.messages

from aoc_bot.__main__ import Model

plugin = crescent.Plugin[hikari.GatewayBot, Model]()


@plugin.include
@crescent.command(
    name="help_aoc",
    description="Get help with using the AoC Bot",
)
class HelpCommand:
    async def callback(self, ctx: crescent.Context) -> None:
        # Format the join codes with optional hint into a newline-delimited str
        join_codes = plugin.model.join_codes.split(",")
        regex = re.compile(r"([[a-z0-9-]+) *(?:\((.+)\))?")
        formatted = "\n"
        for join_code in join_codes:
            match = regex.match(join_code.strip())
            if match is None:
                continue

            formatted += match.group(1)
            if match.group(2) is not None:
                formatted += " (" + match.group(2) + ")"
            formatted += "\n"

        builder = ctx.interaction.build_response().add_component(
            hikari.impl.TextDisplayComponentBuilder(
                content=f"""
# AoC Notifier Bot

During December 1-12, https://adventofcode.com will run! This is a 12-day
challenge with 2 coding questions per day. To make it somewhat competitive as
well as rewarding, CompSoc runs the following annually:

- The Notifier bot: Notifies Discord when someone completes a day of challenges!
- Rewards Shop: Exchange your progress with some tangible rewards!

To sign up for these, you **must** join one of the CompSoc-verified private
leaderboards on Advent of Code. Afterwards, you may choose to link your Discord
ID to your AoC ID with `/link_aoc` to prevent someone else from claiming the ID
(and stars!) is yours, but this is optional.

## Private Leaderboard Join Codes

The following are leaderboard join codes for this year. If any are full, please
try other ones. If all are full, please notify CompSoc admins.

```{formatted}```

## AoC ID to pass to `/link_aoc`

To find out your AoC ID, visit the Settings page in https://adventofcode.com/.
"""
            )
        )
        builder.set_flags(hikari.messages.MessageFlag.EPHEMERAL)
        await ctx.respond_with_builder(builder)
