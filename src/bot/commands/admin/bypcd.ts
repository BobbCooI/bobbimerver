import { executeArgs } from "lib/bot/discordThings";
import { Command } from "../../../../lib/bot/Command";
import Discord from "discord.js";
export default new Command(
  {
    category: "admin",

    slashOptions: {
      commandOptions: new Discord.SlashCommandBuilder()
        .setName("bypcd")
        .setDescription("turn off cooldowns for any user")
        .addUserOption((option) =>
          option
            .setName("string")
            .setDescription("user id to turn off cooldowns for")
            .setRequired(false)
        )
        .setDMPermission(false),
    },
    restrictTo: "guild",
    ownerOnly: true,
  },
  async ({ slashInt }: executeArgs) => {
    const user: Discord.User =
      (await slashInt.client.users.fetch(
        slashInt.slash.options.getString("guy") || ""
      )) || slashInt.slash.user;

    const success = await slashInt.Bobb.mongo.Person.toggleBypassCD(user.id);
    if (success)
      return `Successfully toggled cooldown bypass to \`${success}\` for ${user}!`;
    else return "Unsuccessful.. is the user in the database?";
  }
);
