import Discord from "discord.js";
import { executeArgs } from "lib/bot/botTypes";
import { Command } from "../../../../lib/bot/Command";
import axios from 'axios';
import { options } from '../../../config.json';
import _ from "lodash"
export default new Command(
  {
    name: "vrvgetep",
    description: `3/3: Choose episodes from ${options.prefix}vrvChoose. Usage: 1, 1,2, 1-2, or 'latest'`,
    enableSlashCommand: true,
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
    if (!Swessage.args ?? !Swessage.args?.size) return `give me an episode from them choices 🙄`
    let st = Date.now();
    let person = Swessage.Bobb.VRV.cache[Swessage.author.id];
    if (!person) return `Please start by choosing an anime with the command \`${options.prefix}vrvSearch <term(s)>\``;
    addCD?.();
    let initial = await Swessage.send("Getting stream..");

    // This regex matches for comma separated values and ranges. Ex: 3, 4, 7-9, 2, jfla, 88. Array would be ["3", "4", "7-9"", "2"]
    let epNums: any[] | null | undefined = Swessage.args.get("episodes")?.value!.toString()?.match(/([0-9]+(-[0-9]+)?)(([0-9]+(-[0-9]+)?))*|latest/gi)
    if (!epNums || epNums == null) return "Invalid episode number. Input can be `2` or `2-3`"

    epNums = epNums.map((num) => {
      if (!isNaN(num) && !num.includes("-") && num.toLowerCase() !== "latest") return num;
      //if(num == "-") return epNums![ind +1] ? _.range(parseInt(epNums![ind -1]), parseInt(epNums![ind + 1]!)): null
      else if (num.includes("-")) {
        num = num.split("-")
        return _.range(parseInt(num[0]), parseInt(num[1]) + 1)
      } else if(num.toLowerCase() == "latest") {
        return num
      } else return null;
    })

    // Flattens the array, removes any values that isn't a number
    epNums = [...new Set(_.flattenDeep(epNums))].filter(Boolean);

    let epFromId = await Swessage.Bobb.VRV.getStream(epNums, initial, Swessage.author.id);
    if (epFromId!.success === false) return `${epFromId.error!}`;
    let mediaEmbeds: Array<Discord.MessageEmbed> = [];
    for (let ep in epFromId.epMedia!) {
      const shortenedURL: string = epFromId.epMedia[ep].shortenedURL = (await axios.get(`https:\/\/tinyurl.com/api-create.php?url=${epFromId.epMedia[ep].streamURL}`))?.data;
      let emb = new Discord.MessageEmbed()
        .setColor(Math.floor(Math.random() * 0xffffff))
        .setTitle(`${Swessage.Bobb.VRV.cache[Swessage.author.id]?.choiceTitle} | ${epFromId.epMedia[ep].epTitle}`)
        .setDescription(`Episode Number: ${ep}`)
        .addField(`Stream URL: `, shortenedURL ?? epFromId.epMedia[ep].streamURL, true)
        .setTimestamp()
        .setFooter(
          `Requested by ${Swessage.author.tag
          } | Time taken: ${Swessage.Bobb.utils.timeMilli(epFromId.epMedia[ep]!.timeTaken)}`
        );
      person.latest = emb;
      mediaEmbeds.push(emb);
    }

    epFromId.message
      ? await epFromId.message.edit(
        `Finished! Total time taken: ${Swessage.Bobb.utils.timeMilli(Date.now() - st)}`
      )
      : await initial.edit(
        `Finished! Total time taken: ${Swessage.Bobb.utils.timeMilli(Date.now() - st)}`
      );
    Swessage.Bobb.VRV.setCacheEmbed(Swessage.author.id, mediaEmbeds[0])
    
    // @ts-ignore
    const epButtons: Discord.MessageButtonOptions[] = Object.keys(epFromId.epMedia).map(streamNumber => ({
      type: 2,
      label: streamNumber,
      style: "LINK",
      url: epFromId.epMedia[streamNumber].shortenedURL
    }));
    const Ret = new Swessage.Bobb.Return(Swessage.Bobb, { Paginate: true });
    Ret
      .setEmbeds(mediaEmbeds)
      .modernPaginate(Swessage, "Streams")
    //     .setButtons(epButtons)

    return Ret;
  }
);
