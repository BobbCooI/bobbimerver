import Discord from "discord.js";
import { executeArgs } from "../../../../lib/bot/botTypes";
import { options } from '../../../config.json';
import { Command } from "../../../../lib/bot/Command";

export default new Command(
  {
    name: "crgetep",
    description: `3/3 - Get the episodes of your choice from ${options.prefix}crChoose.`,
    enableSlashCommand: false,
    args: [
      {
        id: "episodes",
        type: "string",
        description: "Usage: 1-2 | 1,2 | latest",
        default: undefined,
        required: true
      }
    ],
    cooldown: 10 * 1000
  },
  async ({ Swessage, addCD }: executeArgs) => {
    const st = Date.now();
    let person = Swessage.Bobb.client.crCache[Swessage.author.id];
    if (!person)
      return `Please start by choosing an anime with the command \`${options.prefix}crSearch <term(s)>\``;
    addCD?.();
    let epFromId = await person.getShowById(
      person.choiceId,
      Swessage.args?.get("episodes")?.value,
      Swessage
    );
    let streambeds: Array<Discord.MessageEmbed> = [];
    if (epFromId.res.success === false) return `${epFromId.res.errors}`;
    else {
      for (let ep in epFromId.res.epMedia) {
        let emb = new Discord.MessageEmbed()
          .setColor(Math.floor(Math.random() * 0xffffff))
          .setTitle(
            `${person.choiceTitle} | ${epFromId.res.epMedia[ep].epTitle}`
          )
          .setDescription(`Episode Number: ${ep}`)
          .addField(
            `Stream URL: `,
            epFromId.res.epMedia[ep].hlsStream.url,
            true
          )
          .addField(
            `Expires in: `,
            Swessage.Bobb.utils.parseTime(
              new Date(epFromId.res.epMedia[ep].hlsStream.expires).getTime() -
                Date.now()
            ),
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
        person.latest = emb;
        streambeds.push(emb);
      }
    }

    await epFromId.message.edit(
      `Finished! Time taken: ${Swessage.Bobb.utils.timeMilli(Date.now() - st)}`
    );
    const Ret = new Swessage.Bobb.Return(Swessage.Bobb, {Paginate: true});
    Ret
      .setEmbeds(streambeds)
      .modernPaginate(Swessage, "Streams");
      return Ret;
    /*  return {
  title: `Episodes chosen: ${epFromId.selData.eps}`,
  description: Bobb.utils.chunkSubstr(epFromId, 1940)
  }*/
  });
