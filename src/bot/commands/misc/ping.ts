import { executeArgs } from "lib/bot/discordThings";
import { Command } from "../../../../lib/bot/Command";
import Discord from "discord.js";
export default new Command(
  {
    category: "misc",
    slashOptions: {
      commandOptions: new Discord.SlashCommandBuilder()
        .setName("ping")
        .setDescription(`check bot ping`)
        .setDMPermission(true),
    },
    restrictTo: "all",
  },
  async ({ slashInt }: executeArgs) => {
    const ret = new slashInt.Bobb.Return(slashInt.Bobb);
    ret.setContent(
      `🏓 Pong! ${Date.now() - slashInt.slash.createdTimestamp}ms`
    );
    return ret;
  }
);
