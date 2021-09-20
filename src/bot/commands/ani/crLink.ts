import {MessageEmbed} from "discord.js";
import { executeArgs } from "lib/bot/botTypes";
import { Command } from "../../../../lib/bot/Command";
export default new Command(
  {
    name: "crlink",
    description: "Input an episode link from crunchyroll and you'll get back the video link.",
    enableSlashCommand: true,
      args: [
        {
          id: "link",
          type: "string",
          default: undefined,
          required: true
        }
      ],
    cooldown: 5 * 1000
  },
  async ({ Swessage, addCD }: executeArgs) => {
let st = Date.now();
    addCD?.();
    let person = Swessage.Bobb.client.crCache[Swessage.author.id];
    if (!person) {
      person = Swessage.Bobb.client.crCache[Swessage.author.id] = new Swessage.Bobb.Crunchy(
        Swessage.author.id,
        Swessage.Bobb
      );
       await person.login();
    }
    let epFromUrl = await person.getEpByUrl(Swessage.args?.get("link")?.value, Swessage);

    if (epFromUrl!.success === false) return `Error! ${epFromUrl.error}`;
    else {
      person = Swessage.Bobb.client.crCache[Swessage.author.id];

      let emb = new MessageEmbed()
        .setColor(Math.floor(Math.random() * 0xffffff))
        .setTitle(`${epFromUrl.res.aniTitle} | ${epFromUrl.res.epTitle}`)
        .setDescription(`Episode Number: ${epFromUrl.res.epNum}`)
        .addField(`HLS Stream: `, epFromUrl.res.hlsStream, true)
        .setTimestamp()
        .setFooter(`Requested by ${Swessage.author.tag}`);
      await epFromUrl.message.edit(
        `Finished! Time taken: ${Swessage.Bobb.utils.timeMilli(Date.now() - st)}`
      );

      const Ret =new Swessage.Bobb.Return(Swessage.Bobb)
      Ret.setEmbeds([emb]);
      return Ret;
    }
  }
);
