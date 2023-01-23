import { executeArgs } from "lib/bot/discordThings";
import { Command } from "../../../../lib/bot/Command";
import Discord from "discord.js";
export default new Command(
  {
    category: "misc",
    slashOptions: {
      isSubCommand: true,
      groupName: "aigen",
      commandOptions: new Discord.SlashCommandSubcommandBuilder()
        .setName("image")
        .setDescription(`generate an image based off a text prompt`)
        .addStringOption((option) =>
          option
            .setName("prompt")
            .setDescription("the description of the image to the ai")
            .setRequired(true)
        ),
    },
    restrictTo: "guild",
  },
  async ({ slashInt }: executeArgs) => {
    const text = slashInt.slash.options.getString("prompt");
    const res = await slashInt.Bobb.openai.createImage({
      prompt: text!,
    });

    return res.data.data[0].url;
  }
);
