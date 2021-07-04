import GenericCommand from "../../commandTypes/GenericCommand";
import Discord from "discord.js";
import { runFnArgs } from "../../../types/bot";
import { prefix } from '../../../utils/constants'
export default new GenericCommand(
  {
    triggers: ["crsearch", "csearch", "crunchysearch"],
    usage: "{command} {searchTerm}",
    description:
      "1/3 - Use this command to search for an anime of your choice with Crunchyroll.",
    slashCmd: true,
    slashOpts: {
      name: "crsearch",
      description: "Use this command to search. Then use crChoose to choose.",
      options: [
        {
          name: "search_query",
          description: "Search for an anime with Crunchyroll.",
          type: 3,
          required: true
        }
      ]
    },
    cooldown: 8 * 1000
  },
  async ({ Bobb, message, addCD, argManager }: runFnArgs) => {
    addCD()
    if (Bobb!.client.crCache[message!.author.id])
      delete Bobb!.client.crCache[message!.author.id];
    let startTime = new Date().getTime();
    let base = (Bobb!.client.crCache[message!.author.id] = new Bobb!.Crunchy(
      message!.author.id,
      Bobb
    ));
    await base.login();

    let search = await base.search(argManager!.args);
    let en = Date.now();
    if (search!.success === false) return search.error;
    else
      return new Bobb!.Return("message").setEmbeds([new Discord.MessageEmbed()
        .setTitle( "Choices")
        .setDescription( search.join("\n"))
        .setFooter(`Time taken: ${Bobb!.utils.timeMili(
          en - startTime
        )} - You can choose like this: ${prefix}crChoose 1st`)
      ]);
  },
  async ({ Bobb, interaction, argslash, addCD }: runFnArgs) => {
    addCD();
    if (Bobb!.client.crCache[interaction!.user.id])
      delete Bobb!.client.crCache[interaction!.user.id];
    let startTime = Date.now();
    let base = (Bobb!.client.crCache[interaction!.user.id] = new Bobb!.Crunchy(
      interaction!.user.id,
      Bobb
    ));
     await base.login();

    let search = await base.search(argslash!.get("search_query")!.value);
    let en = new Date().getTime();
    if (search!.success === false) return search.error;
    else {
      let Ret  = new Bobb!.Return("message")
      Ret.setEmbeds([ new Discord.MessageEmbed()
        .setTitle("Choices")
        .setDescription(search.join("\n"))
        .setFooter(
          `Time taken: ${Bobb!.utils.timeMili(
            en - startTime
          )} - You can choose like this: ${prefix}crChoose 1st`
        )]);
        return Ret;
        }
  }
);
