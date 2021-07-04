import GenericCommand from "../../commandTypes/GenericCommand";
import Discord from "discord.js";
import { runFnArgs } from "../../../types/bot";
import { prefix } from '../../../utils/constants'
export default new GenericCommand(
  {
    triggers: ["crgetep", "cgetep", "crunchygetep"],
    usage: "{command} {1-3 or 1,2,3 or latest}",
    description:
    `3/3 - Use this command to get the episodes of your choice from ${prefix}crChoose. Usage can be 1, 1,2, 1-2, or 'latest'`,
    slashCmd: true,
    slashOpts: {
      name: "crgetep",
      description: "Get episode from chosen anime.",
      options: [
        {
          type: 3,
          name: "episodes",
          description: "Usage: 1-2 | 1,2 | latest",
          required: true
        }
      ],
    },
    cooldown: 10 * 1000
  },
  async ({ Bobb, message, argManager , addCD }: runFnArgs) => {
    const st = Date.now();
    let person = Bobb!.client.crCache[message!.author.id];
    if (!person)
      return `Please start by choosing an anime with the command \`${prefix}crSearch <term(s)>\``;
    addCD();
    let epFromId = await person.getShowById(
      person.choiceId,
      argManager!.args?.join("").toString(),
      message
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
            Bobb!.utils.parseTime(
              new Date(epFromId.res.epMedia[ep].hlsStream.expires).getTime() -
                Date.now()
            ),
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
        person.latest = emb;
        streambeds.push(emb);
      }
    }

    await epFromId.message.edit(
      `Finished! Time taken: ${Bobb!.utils.timeMili(Date.now() - st)}`
    );
    const Ret = new Bobb!.Return("message", {Paginate: true});
    Ret
      .setEmbeds(streambeds)
      .Paginator(message!, "Streams");
      return Ret;
    /*  return {
  title: `Episodes chosen: ${epFromId.selData.eps}`,
  description: Bobb.utils.chunkSubstr(epFromId, 1940)
  }*/
  },
  async ({ Bobb, interaction, argslash, addCD }: runFnArgs) => {
    addCD();
    let st = Date.now();
    let person = Bobb!.client.crCache[interaction!.user.id];
    if (!person)
      return `Please start by choosing an anime with the command \`/crSearch <term(s)>\``;

    let epFromId = await person.getShowById(person.choiceID, argslash!.get("episodes")!.value);
    if (epFromId.success === false)
      return `${
        epFromId.res.errors ? epFromId.res.errors : epFromId.res.error
      }`;
    else {
      let embeds: Array<Discord.MessageEmbed> = [];
      Object.keys(epFromId.res.epMedia).forEach((ep) => {
        let emb = new Discord.MessageEmbed()
          .setColor(Math.floor(Math.random() * 0xffffff))
          .setTitle(
            `${person.choiceTitle} | ${epFromId.res.epMedia[ep].epTitle}`
          )
          .setDescription(`Episode Number: ${ep}`)
          .addField(
            `HLS Stream: `,
            epFromId.res.epMedia[ep].hlsStream.url,
            true
          )
          .addField(
            `Expires in: `,
            Bobb!.utils.parseTime(
              new Date(epFromId.res.epMedia[ep].hlsStream.expires).getTime() -
                Date.now()
            ),
            true
          )
          .setTimestamp()
          .setFooter(
            `Requested by ${interaction!.user.username}#${
              interaction!.user.discriminator
            } | Time taken{ ${Bobb!.utils.timeMili(
              epFromId.res.epMedia[ep].tTime
            )}`
          );
        //   emb.content = Object.keys(epFromId.res.epMedia).length == 1?"_ _":`${index+1}/${Object.keys(epFromId.res.epMedia).length}`;
        embeds.push(emb);
      });

      person.latest = embeds[embeds.length - 1];
      const Ret = new Bobb!.Return("interaction");
      Ret
        .setEmbeds(embeds)
        .setContent(
          `Done! Total time taken: ${Bobb!.utils.timeMili(Date.now() - st)}`
        );
        return Ret;
    }
  }
);
