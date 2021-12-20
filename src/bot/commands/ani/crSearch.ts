import { executeArgs } from "lib/bot/botTypes";
import { Command } from "../../../../lib/bot/Command";
import { Permissions, MessageEmbed } from "discord.js"
export default new Command({

  name: "crsearch",
  description: "1/3 -Search for an anime of your choice with Crunchyroll.",
  clientPermissions: [
    Permissions.FLAGS.SEND_MESSAGES,
    Permissions.FLAGS.EMBED_LINKS,
  ],
  args: [
    {
      id: "search_query",
      type: "string",
      default: undefined,
      required: true,
    },
  ],
  enableSlashCommand: false,
  restrictTo: "all",
  ephemeral: true,
  cooldown: 8 * 1000
},
  async ({ Swessage, addCD }: executeArgs) => {
    addCD?.()
    if (Swessage.Bobb.client.crCache[Swessage.author.id])
      delete Swessage.Bobb.client.crCache[Swessage.author.id];
    let startTime = new Date().getTime();
    let base = (Swessage.Bobb.client.crCache[Swessage.author.id] = new Swessage.Bobb.Crunchy(
      Swessage.author.id,
      Swessage.Bobb
    ));
    await base.login();

    let search = await base.search(Swessage.args?.get("search_query")?.value);
    let en = Date.now();
    if (search!.success === false) return search.error;
    else
      return new Swessage.Bobb.Return(Swessage.Bobb).setEmbeds([new MessageEmbed()
        .setTitle("Choices")
        .setDescription(search.join("\n"))
        .setFooter(`Time taken: ${Swessage.Bobb.utils.timeMilli(
          en - startTime
        )} - You can choose like this: ${Swessage.Bobb.config.options.prefix}crChoose 1st`)
      ]);
  }
);
