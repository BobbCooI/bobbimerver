import GenericCommand from "../../commandTypes/GenericCommand";
import Discord from "discord.js";
import { runFnArgs } from "../../../types/bot";

export default new GenericCommand(
  {
    triggers: ["crlink", "clink", "crunchylink", "crl"],
    usage: "{command} {link}",
    description:
      "Input an episode link from crunchyroll and you'll get back the video link.",
    slashCmd: true,
    slashOpts: {
      name: "crlink",
      description: "Input an episode link from crunchyroll.",
      options: [
        {
          type: 3,
          name: "link",
          description: "Crunchyroll link",
          required: true
        }
      ]
    },
    cooldown: 5*1000
  },
  async ({ Bobb, message, addCD, args }: runFnArgs) => {
        if(!args ?? !((args as Array<string>).length)) return `pick something to choose 🙄`;

let st = Date.now();
    addCD();
    let person = Bobb!.client.crCache[message!.author.id];
    if (!person) {
      person = Bobb!.client.crCache[message!.author.id] = new Bobb!.Crunchy(
        message!.author.id,
        Bobb
      );
       await person.login();
    }
    let epFromUrl = await person.getEpByUrl((args as string[])[0], message);

    if (epFromUrl!.success === false) return `Error! ${epFromUrl.error}`;
    else {
      person = Bobb!.client.crCache[message!.author.id];

      let emb = new Discord.MessageEmbed()
        .setColor(Math.floor(Math.random() * 0xffffff))
        .setTitle(`${epFromUrl.res.aniTitle} | ${epFromUrl.res.epTitle}`)
        .setDescription(`Episode Number: ${epFromUrl.res.epNum}`)
        .addField(`HLS Stream: `, epFromUrl.res.hlsStream, true)
        .setTimestamp()
        .setFooter(`Requested by ${message!.author.tag}`);
      await epFromUrl.message.edit(
        `Finished! Time taken: ${Bobb!.misc.timeMili(Date.now() - st)}`
      );

      const Ret =new Bobb!.Return("message")
      Ret.setEmbeds([emb]);
      return Ret;
    }
  },
  async ({ Bobb, interaction, addCD, argslash }: runFnArgs) => {
  addCD();
    let st = Date.now();
    let person = Bobb!.client.crCache[interaction!.user.id];
    if (!person) {
      person = Bobb!.client.crCache[interaction!.user.id] = new Bobb!.Crunchy(
        interaction!.user.id,
        Bobb
      );
       await person.login();
    }
    let epFromUrl = await person.getEpByUrl(argslash!.get("link")!.value, interaction);

    if (epFromUrl.success === false) return `Error! ${epFromUrl.error}`;
    else {
      person = Bobb!.client.crCache[interaction!.user.id];

      let emb = new Discord.MessageEmbed()
        .setColor(Math.floor(Math.random() * 0xffffff))
        .setTitle(`${epFromUrl.res.aniTitle} | ${epFromUrl.res.epTitle}`)
        .setDescription(`Episode Number: ${epFromUrl.res.epNum}`)
        .addField(`HLS Stream: `, epFromUrl.res.hlsStream, true)
        .setTimestamp()
        .setFooter(
          `Requested by ${
            interaction!.user.username
          }#${interaction!.user.discriminator} | Time taken: ${Bobb!.misc.timeMili(Date.now() - st)}`
        );
      person.latest = emb;
      const Ret =  new Bobb!.Return("interaction")
      Ret.setEmbeds([emb]);
      return Ret;
    }
  }
);
