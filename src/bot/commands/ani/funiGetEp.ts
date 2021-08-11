import GenericCommand from "../../commandTypes/GenericCommand";
import Discord from "discord.js";
import { runFnArgs } from "../../../types/bot";
import { prefix } from '../../../config.json'
export default new GenericCommand(
  {
    triggers: ["funigetep", "fgetep", "fungetep"],
    usage: "{command} {1-3 or 1,2,3 or latest}",
    description:
      `3/3 - Use this command to get the episodes of your choice from ${prefix}funiChoose. Usage can be 1, 1,2, 1-2, or 'latest'`,
    slashCmd: true,
    slashOpts: {
      name: "funigetep",
      description: "Get episode from chosen anime.",
      options: [
        {
          type: 3,
          name: "episodes",
          description: "Usage: 1-2 | 1,2 | latest",
          required: true
        }
      ]
    },
    cooldown: 10 * 1000
  },
  async ({ Bobb, message, argManager, addCD }: runFnArgs) => {
    const st = Date.now();
    let person = Bobb!.client.funiCache[message!.author.id];
    if (!argManager!.args)
      return `Please start by choosing an anime with the command \`${prefix}funiSearch <term(s)>\``;
    addCD();
    let epFromId = await person.getEp(argManager!.args?.join("").toString(), message);
    let streambeds: Array<Discord.MessageEmbed> = [];
    if (epFromId.success === false) return `${epFromId.error}`;
    else {
      for (let ep in epFromId.res.epMedia) {
        if (epFromId.res.epMedia[ep].vData.success) {
          let emb = new Discord.MessageEmbed()
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
                message!.author.tag
              } | Time taken: ${Bobb!.utils.timeMili(
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
          let emb = new Discord.MessageEmbed()
            .setColor(Math.floor(Math.random() * 0xffffff))
            .setTitle(
              `${person.choiceTitle} | ${epFromId.res.epMedia[ep].episodeName}`
            )
            .addField("Error", epFromId.res.epMedia[ep].vData.error)
            .setTimestamp()
            .setFooter(
              `Requested by ${
                message!.author.tag
              } | Time taken: ${Bobb!.utils.timeMili(
                epFromId.res.epMedia[ep].tTime
              )}`
            );
          streambeds.push(emb);
        }
      }
    }

    await epFromId.message.edit(
      `Finished! Total time taken: ${Bobb!.utils.timeMili(Date.now() - st)}`
    );
    const Ret = new Bobb!.Return("message", { Paginate: true });
    Ret.setEmbeds(streambeds).Paginator(message!, "Streams");
    return Ret;
  },
  async ({ Bobb, interaction, argslash, addCD }: runFnArgs) => {
    addCD();
    let st = Date.now();
    let person = Bobb!.client.funiCache[interaction!.user.id];
    if (!person || !person.choiceID)
      return `Please start by choosing an anime with the command \`${prefix}funiSearch <term(s)>\``;

    let epFromId = await person.getEp(
      argslash!.get("episodes")!.value,
      interaction
    );
    let streambeds: Array<Discord.MessageEmbed> = [];

    if (epFromId.success === false) return `${epFromId.error}`;
    else {
      for (let ep in epFromId.res.epMedia) {
        if (epFromId.res.epMedia[ep].vData.success) {
          let emb = new Discord.MessageEmbed()
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
                interaction!.user.tag
              } | Time taken: ${Bobb!.utils.timeMili(
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
          let emb = new Discord.MessageEmbed()
            .setColor(Math.floor(Math.random() * 0xffffff))
            .setTitle(
              `${person.choiceTitle} | ${epFromId.res.epMedia[ep].episodeName}`
            )
            .addField("Error", epFromId.res.epMedia[ep].vData.error)
            .setTimestamp()
            .setFooter(
              `Requested by ${
                interaction!.user.tag
              } | Time taken: ${Bobb!.utils.timeMili(
                epFromId.res.epMedia[ep].tTime
              )}`
            );
          streambeds.push(emb);
        }
      }
    }
    person.latest = streambeds[streambeds.length - 1];
    const Ret = new Bobb!.Return("interaction");
    Ret.setEmbeds(streambeds).setContent(
      `Done! Total time taken: ${Bobb!.utils.timeMili(Date.now() - st)}`
    );
    return Ret;
  }
);
