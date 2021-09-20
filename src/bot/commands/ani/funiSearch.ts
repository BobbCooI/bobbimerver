import { executeArgs } from "lib/bot/botTypes";
import { Command } from "../../../../lib/bot/Command";
import {Permissions, MessageEmbed} from "discord.js"
export default new Command(
  {
    name: "funisearch",
    description: "1/3 - Use this command to search for an anime of your choice with Funimation.",
    clientPermissions: [
        Permissions.FLAGS.SEND_MESSAGES,
        Permissions.FLAGS.EMBED_LINKS,
    ],
    enableSlashCommand: false,
    args: [
      {
        id: "search_query",
        type: "string",
        description: "Search for an anime with Funimation.",
        default: undefined,
        required: true
      }
    ],
    restrictTo: "all",
    cooldown: 8 * 1000
  },
  async ({ Swessage, addCD }: executeArgs) => {

    if (Swessage.Bobb.client.funiCache[Swessage.author.id])
      delete Swessage.Bobb.client.funiCache[Swessage.author.id];
    let startTime = new Date().getTime();
    let base = (Swessage.Bobb.client.funiCache[Swessage.author.id] = new Swessage.Bobb.Funi(
      Swessage.author.id,
      Swessage.Bobb,
      { enSub: !(Swessage.author.id=="707704956131475539" || Swessage.author.id=="443145161057370122") }
    ));
    //  let auth = await base.login();

    let search = await base.search(Swessage.args?.get("search_query")?.value);
    let en = new Date().getTime();
    if (search.success === false) return search.error;
    else {
      addCD?.();
      let Ret= new Swessage.Bobb.Return(Swessage.Bobb)
        Ret.setEmbeds([new MessageEmbed()
        .setTitle( "Choices")
        .setDescription(search.res.join("\n"))
        .setFooter(`Time taken: ${Swessage.Bobb.utils.timeMilli(
          en - startTime
        )} - You can choose like this: ${Swessage.Bobb.config.prefix}funiChoose 1st`)
      ]);
      return Ret;
      }
  })