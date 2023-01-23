import Discord from "discord.js";
import { executeArgs } from "lib/bot/discordThings";
import { Command } from "../../../../lib/bot/Command";
export default new Command(
  {
    category: "ani",

    slashOptions: {
      isSubCommand: true,
      groupName: "vrv",
      commandOptions: new Discord.SlashCommandSubcommandBuilder()
        .setName("choose")
        .setDescription(
          `2/3: Choose an anime from /vrv search. Response should be corresponding to the choice number.`
        )
        .addIntegerOption((option) =>
          option
            .setName("selection")
            .setDescription("singular number you want")
            .setRequired(true)
        ),
    },
    
    restrictTo: "guild",
    cooldown: 5 * 1000,
  },
  async ({ slashInt, addCD }: executeArgs) => {
    const userSelection = slashInt.slash.options.getInteger("selection");
    if (!userSelection) return `pick something to choose 🙄`;
    let person = slashInt.Bobb.VRV.cache[slashInt.slash.user.id];
    if (!person)
      return `Please start by finding an anime with the command /vrv search <term(s)>`;
    let choice = await slashInt.Bobb.VRV.choose(
      userSelection,
      slashInt.slash.user.id
    );

    if (choice.success === false) return `Error: ${choice.error}`;
    addCD?.();
    let embeds = [];
    let start = 0;
    let end = 20;
    for (let i = 0; i < Math.ceil(choice.res.length / 20); i++) {
      const emb = new Discord.EmbedBuilder()
        .setTitle(choice.title)
        .setAuthor({
          name: slashInt.slash.user.tag,
          iconURL: slashInt.slash.user.displayAvatarURL(),
        })
        .setDescription(choice.res.slice(start, end).join("\n"))
        .setFooter({ text: `\"vrvGetEp 2\" to get the second episode.` })
        .setTimestamp()
        .setColor(Math.floor(Math.random() * 0xffffff));
      start += 20;
      end += 20;
      embeds.push(emb);
    }
    if (embeds.length === 1) {
      const Ret = new slashInt.Bobb.Return(slashInt.Bobb);
      Ret.setEmbeds(embeds);
      return Ret;
    }
    const Ret = new slashInt.Bobb.Return(slashInt.Bobb, { Paginate: true });
    Ret.setEmbeds(embeds).modernPaginate(
      slashInt,
      `Selection could be "/vrv getep <${
        choice.res[1].split(" ")[0]
      } | ${choice.res[1]
        .split(" ")[0]
        .slice(0, -2)}> to get the second episode.`
    );
    return Ret;
  }
);
