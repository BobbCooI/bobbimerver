import GenericCommand from "../../commandTypes/GenericCommand";
import Discord from "discord.js";
import { runFnArgs } from "../../../types/bot";
export default new GenericCommand(
  {
    triggers: ["funisearch", "fsearch", "funsearch"],
    usage: "{command} {searchTerm(s)}",
    description:
      "1/3 - Use this command to search for an anime of your choice with Funimation.",
    slashCmd: true,
    slashOpts: {
      name: "funisearch",
      description: "Use this command to search. Then use funiChoose to choose.",
      options: [
        {
          name: "search_query",
          description: "Search for an anime with Funimation.",
          type: 3,
          required: true
        }
      ]
    },
    cooldown: 8 * 1000
  },
  async ({ Bobb, message, argManager , addCD}: runFnArgs) => {
    if (Bobb!.client.funiCache[message!.author.id])
      delete Bobb!.client.funiCache[message!.author.id];
    let startTime = new Date().getTime();
    let base = (Bobb!.client.funiCache[message!.author.id] = new Bobb!.Funi(
      message!.author.id,
      Bobb,
      { enSub: !(message!.author.id=="707704956131475539" || message!.author.id=="443145161057370122") }
    ));
    //  let auth = await base.login();

    let search = await base.search(argManager!.args);
    let en = new Date().getTime();
    if (search.success === false) return search.error;
    else {
      addCD();
      let Ret= new Bobb!.Return("message")
        Ret.setEmbeds([new Discord.MessageEmbed()
        .setTitle( "Choices")
        .setDescription(search.res.join("\n"))
        .setFooter(`Time taken: ${Bobb!.utils.timeMili(
          en - startTime
        )} - You can choose like this: ${Bobb!.config.prefix}funiChoose 1st`)
      ]);
      return Ret;
      }
  },
  async ({ Bobb, interaction, argslash, addCD }: runFnArgs) => {
    if (Bobb!.client.funiCache[interaction!.user.id])
      delete Bobb!.client.funiCache[interaction!.user.id];
    let startTime = new Date().getTime();
    let base = (Bobb!.client.funiCache[interaction!.user.id] = new Bobb!.Funi(
      interaction!.user.id,
      Bobb,
      { enSub: !(interaction!.user.id=="707704956131475539" || interaction!.user.id=="443145161057370122") }
    ));
     await base.login();

    let search = await base.search(argslash!.get("search_query")!.value);
    let en = new Date().getTime();
    if (search.success === false) return search.error;
    else {
    addCD();
      const Ret = new Bobb!.Return("interaction")
      Ret.setEmbeds([
        new Discord.MessageEmbed()
          .setTitle("Choices")
          .setDescription(search.res.join("\n"))
          .setFooter(
            `Time taken: ${Bobb!.utils.timeMili(
              en - startTime
            )} - You can choose like this: /funiChoose 1st`
          )
      ]);
      return Ret;
      }
  }
);
