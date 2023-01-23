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
        .setName("search")
        .setDescription(
          "1/3 - Use this command to search for an anime of your choice with Funimation."
        )
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("search for an anime with funimation")
            .setRequired(true)
        ),
    },
    
    enabled: false,
    restrictTo: "guild",
    cooldown: 8 * 1000,
  },
  async ({ slashInt, addCD }: executeArgs) => {
    if (slashInt.Bobb.client.funiCache[slashInt.slash.user.id])
      delete slashInt.Bobb.client.funiCache[slashInt.slash.user.id];
    let startTime = new Date().getTime();
    let base = (slashInt.Bobb.client.funiCache[slashInt.slash.user.id] =
      new slashInt.Bobb.Funi(slashInt.slash.user.id, slashInt.Bobb, {
        enSub: !(
          slashInt.slash.user.id == "707704956131475539" ||
          slashInt.slash.user.id == "443145161057370122"
        ),
      }));
    //  let auth = await base.login();

    let search = await base.search(slashInt.slash.options.getString("query"));
    let en = new Date().getTime();
    if (search.success === false) return search.error;
    else {
      addCD?.();
      let Ret = new slashInt.Bobb.Return(slashInt.Bobb);
      Ret.setEmbeds([
        new Discord.EmbedBuilder()
          .setTitle("Choices")
          .setDescription(search.res.join("\n"))
          .setFooter({
            text: `Time taken: ${slashInt.Bobb.utils.timeMilli(
              en - startTime
            )} - You can choose like this: /funi choose 1st`,
          }),
      ]);
      return Ret;
    }
  }
);
