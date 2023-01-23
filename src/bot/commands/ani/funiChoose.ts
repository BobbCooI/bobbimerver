import { executeArgs } from "lib/bot/discordThings";
import { Command } from "../../../../lib/bot/Command";
import Discord from "discord.js";
export default new Command(
  {
    category: "ani",
    slashOptions: {
      isSubCommand: true,
      groupName: "funi",
      commandOptions: new Discord.SlashCommandSubcommandBuilder()
        .setName("choose")
        .setDescription(
          `2/3 - Choose the anime from /funi search. Number corresponding to the choices.`
        )
        .addIntegerOption((option) =>
          option
            .setName("selection")
            .setDescription("singular name you want")
            .setRequired(true)
        ),
    },
    enabled: false,
    restrictTo: "guild",
    cooldown: 5 * 1000,
  },
  async ({ slashInt, addCD }: executeArgs) => {
    let person = slashInt.Bobb.client.funiCache[slashInt.slash.user.id];
    if (!person)
      return `Please start by choosing an anime with the command /funi search <term(s)>`;
    let choice = person.choose(slashInt.slash.options.getInteger("selection"));

    if (choice!.success === false) return `Error: ${choice.error}`;
    addCD?.();
    person = slashInt.Bobb.client.funiCache[slashInt.slash.user.id];
    let emb = new Discord.EmbedBuilder()
      .setTitle(person.choiceTitle)
      .setDescription(`Success! The title ID is ${choice.res}`)
      .addFields({
        name: `Final step command: /funi getep 2`,
        value: "This would fetch the 2nd episode of the anime.",
      })
      .setFooter({
        text: "Make sure the selected anime episode of the season is correct!",
      })
      .setTimestamp()
      .setColor(Math.floor(Math.random() * 0xffffff));
    const Ret = new slashInt.Bobb.Return(slashInt.Bobb);
    Ret.setEmbeds([emb]);
    return Ret;
  }
);
