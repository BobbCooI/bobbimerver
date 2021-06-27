import GenericCommand from "../../commandTypes/GenericCommand";
import Discord from "discord.js";
import { runFnArgs } from "../../../types/bot";
import axios from 'axios';
import { prefix } from '../../../utils/constants'
export default new GenericCommand(
  {
    triggers: ["vrvgetep", "vgetep"],
    usage: "{command} {1-3 or 1,2,3 or latest}",
    description:
      `3/3 - Use this command to get the episodes of your choice from ${prefix}vrvChoose. Usage can be 1, 1,2, 1-2, or 'latest'`,
    slashCmd: false,
    slashOpts: {
      name: "vrvgetep",
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
  async ({ Bobb, message, addCD, args }: runFnArgs) => {
      if(!args ?? !(args as Array<string>).length) return `give me an episode from them choices 🙄`
    let st = Date.now();
    let person = Bobb!.VRV.cache[message!.author.id];
    if (!person) return `Please start by choosing an anime with the command \`${prefix}vrvSearch <term(s)>\``;
    addCD();
    let initial = await message!.channel.send("Getting stream..");
    let epFromId = await Bobb!.VRV.getStream(args!.join("").toString(), initial, message!.author.id);
    if (epFromId!.success === false) return `${epFromId.error!}`;
    let mediaEmbeds: Array<Discord.MessageEmbed> = [];
    for (let ep in epFromId.epMedia!) {
    const shortenedURL: string = (await axios.get(`https:\/\/tinyurl.com/api-create.php?url=${epFromId.epMedia[ep].streamURL}`))?.data;
      let emb = new Discord.MessageEmbed()
        .setColor(Math.floor(Math.random() * 0xffffff))
        .setTitle(`${Bobb!.VRV.cache[message!.author.id]?.choiceTitle} | ${epFromId.epMedia[ep].epTitle}`)
        .setDescription(`Episode Number: ${ep}`)
        .addField(`Stream URL: `,  shortenedURL ?? epFromId.epMedia[ep].streamURL, true)
        .setTimestamp()
        .setFooter(
          `Requested by ${
            message!.author.tag
          } | Time taken: ${Bobb!.utils.timeMili(epFromId.epMedia[ep]!.timeTaken)}`
        );
      person.latest = emb;
      mediaEmbeds.push(emb);
    }

    epFromId.message
      ? await epFromId.message.edit(
          `Finished! Total time taken: ${Bobb!.utils.timeMili(Date.now() - st)}`
        )
      : await initial.edit(
          `Finished! Total time taken: ${Bobb!.utils.timeMili(Date.now() - st)}`
        );
        Bobb!.VRV.setCacheEmbed(message!.author.id, mediaEmbeds[0])
    const Ret = new Bobb!.Return("message", {Paginate: true});
    Ret.setEmbeds(mediaEmbeds).Paginator(message!, "Streams");
      return Ret;
  }
);
