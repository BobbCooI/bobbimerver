import { options } from '../../../config.json';
import { executeArgs } from "lib/bot/botTypes";
import { Command } from "../../../../lib/bot/Command";
import {Permissions, MessageEmbed} from "discord.js"
export default new Command(
  {
    name: "funigetep",
    description:`3/3 - Get the episodes of your choice from ${options.prefix}funiChoose. Usage can be 1, 1,2, 1-2, or 'latest'`,
    clientPermissions: [
        Permissions.FLAGS.SEND_MESSAGES,
        Permissions.FLAGS.EMBED_LINKS,
    ],
    enableSlashCommand: false,
    args: [
      {
        id: "episodes",
        type: "string",
        description: "Usage: 1 | 1-2 | 1,2 | latest",
        default: undefined,
        required: true
      }
    ],
    restrictTo: "all",
    cooldown: 10 * 1000
  },
  async ({ Swessage, addCD }: executeArgs) => {
    const st = Date.now();
    let person = Swessage.Bobb.client.funiCache[Swessage.author.id];

    addCD?.();
    const gettingEps = await Swessage.send("Getting episodes...");
    let epFromId = await person.getEp(Swessage.args?.get("episodes")?.value);
    let streambeds: Array<MessageEmbed> = [];
    if (epFromId.success === false) return `${epFromId.error}`;
    else {
      for (let ep in epFromId.res.epMedia) {
        if (epFromId.res.epMedia[ep].vData.success) {
          let emb = new MessageEmbed()
            .setColor(Math.floor(Math.random() * 0xffffff))
            .setTitle(
              `${person.choiceTitle} | ${epFromId.res.epMedia[ep].episodeName}`
            )
            .setDescription(`Episode Number: ${ep}`)
            .addField(
              `Stream URL: `,
              epFromId.res.epMedia[ep].vData.res.videoUrl,
              true
            )
            .setTimestamp()
            .setFooter(
              `Requested by ${
                Swessage.author.tag
              } | Time taken: ${Swessage.Bobb.utils.timeMilli(
                epFromId.res.epMedia[ep].tTime
              )}`
            );
          if (epFromId.res.epMedia[ep].vData.res.subsUrl)
            emb.addField(
              `Subs URL: `,
              epFromId.res.epMedia[ep].vData.res.subsUrl,
              true
            );

          if (epFromId.res.epMedia[ep].vData.res.info)
            emb.addField(
              `Info: `,
              epFromId.res.epMedia[ep].vData.res.info,
              true
            );

          person.latest = emb;
          streambeds.push(emb);
        } else if (epFromId.res.epMedia[ep].vData.res.success == false) {
          let emb = new MessageEmbed()
            .setColor(Math.floor(Math.random() * 0xffffff))
            .setTitle(
              `${person.choiceTitle} | ${epFromId.res.epMedia[ep].episodeName}`
            )
            .addField("Error", epFromId.res.epMedia[ep].vData.error)
            .setTimestamp()
            .setFooter(
              `Requested by ${
                Swessage.author.tag
              } | Time taken: ${Swessage.Bobb.utils.timeMilli(
                epFromId.res.epMedia[ep].tTime
              )}`
            );
          streambeds.push(emb);
        }
      }
    }

    await gettingEps.edit(
      `Finished! Total time taken: ${Swessage.Bobb.utils.timeMilli(Date.now() - st)}`
    );
    const Ret = new Swessage.Bobb.Return(Swessage.Bobb, { Paginate: true });
    Ret.setEmbeds(streambeds).modernPaginate(Swessage, "Streams");
    return Ret;
  });
