import Discord, { SlashCommandSubcommandBuilder } from "discord.js";
import { executeArgs } from "lib/bot/discordThings";
import { Command } from "../../../../lib/bot/Command";

export default new Command(
  {
    category: "ani",

    slashOptions: {
      groupName: "vrv",
      isSubCommand: true,
      commandOptions: new SlashCommandSubcommandBuilder()
        .setName("search")
        .setDescription("1/3: Search for an anime of your choice with VRV.")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("what you wanna search up")
            .setRequired(true)
        ),
    },
    restrictTo: "guild",
    cooldown: 8 * 1000,
  },
  async ({ slashInt, addCD }: executeArgs) => {
    if (!slashInt.slash.options.getString("query"))
      return `atleast give me something to search up 🙄`;
    addCD?.();
    let startTime = Date.now();
    /*let base =Bobb!.client.vrvCache[message!.author.id];
    if (!base) {
     base = (Bobb!.client.vrvCache[message!.author.id] = new Bobb!.VRV(
      message!.author.id,
      Bobb
    ));
    await base.init();
    let auth = await base.auth();
    if (!auth!.success) return `Oh no! ${auth.error}`;
    }  */
    slashInt.Bobb.discordVRV.initPerson(slashInt.slash.user.id);
    let search = await slashInt.Bobb.discordVRV.search(
      slashInt.slash.options.getString("query")!,
      slashInt.slash.user.id
    );
    let end = Date.now();
    if (search.success === false) return search.error;
    const Ret = new slashInt.Bobb.Return(slashInt.Bobb);
    Ret.setEmbeds([
      new Discord.EmbedBuilder()
        .setTitle("Choices")
        .setDescription(search.res.join("\n"))
        .setFooter({
          text: `Time taken: ${slashInt.Bobb.utils.timeMilli(
            end - startTime
          )} - You can choose like this: /vrv choose 1st`,
        }),
    ]);

    return Ret;
  }
);
