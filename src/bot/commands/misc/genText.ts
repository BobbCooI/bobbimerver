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
        .setName("text")
        .setDescription(`give ai a prompt !`)
        .addStringOption((option) =>
          option
            .setName("prompt")
            .setDescription("the prompt to the ai")
            .setRequired(true)
        ),
    },
    enabled: false,
    restrictTo: "guild",
  },
  async ({ slashInt }: executeArgs) => {
    const text = slashInt.slash.options.getString("prompt");
    const res = await slashInt.Bobb.openai.createCompletion({
      model: "text-davinci-003",
      prompt: `respond to this in the most sarcastic way possible: ${text}`,
      temperature: 0.5,
      max_tokens: 500,
      top_p: 1.0,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
    });

    return `${res.data.choices[0].text?.toLowerCase()}`;
  }
);
