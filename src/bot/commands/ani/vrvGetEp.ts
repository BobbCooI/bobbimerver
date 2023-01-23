import Discord from "discord.js";
import { executeArgs } from "lib/bot/discordThings";
import { Command } from "../../../../lib/bot/Command";
import axios from "axios";
import _ from "lodash";
export default new Command(
  {
    category: "ani",

    slashOptions: {
      groupName: "vrv",
      isSubCommand: true,
      commandOptions: new Discord.SlashCommandSubcommandBuilder()
        .setName("getep")
        .setDescription(
          `3/3: Choose episodes from /vrv choose Usage: 1, 1,2, 1-2, or 'latest'`
        )
        .addStringOption((option) =>
          option
            .setName("episodes")
            .setDescription("what you want ofc")
            .setRequired(true)
        ),
    },
    restrictTo: "guild",

    cooldown: 10 * 1000,
  },
  async ({ slashInt, addCD }: executeArgs) => {
    let st = Date.now();
    let person = slashInt.Bobb.VRV.cache[slashInt.slash.user.id];
    if (!person)
      return `Please start by choosing an anime with the command /vrv search <term(s)>`;
    addCD?.();
    let initial = await slashInt.send("Getting stream..");

    // This regex matches for comma separated values and ranges. Ex: 3, 4, 7-9, 2, jfla, 88. Array would be ["3", "4", "7-9"", "2"]
    const EP_MATCHER = /([0-9]+(-[0-9]+)?)(([0-9]+(-[0-9]+)?))*|latest/gi;
    let epNums: any[] | null | undefined = slashInt.slash.options
      .getString("episodes")!
      .match(EP_MATCHER);
    if (!epNums || epNums == null)
      return "Invalid episode number. Input can be `2` or `2-3`";

    epNums = epNums.map((num) => {
      if (!isNaN(num) && !num.includes("-") && num.toLowerCase() !== "latest")
        return num;
      //if(num == "-") return epNums![ind +1] ? _.range(parseInt(epNums![ind -1]), parseInt(epNums![ind + 1]!)): null
      else if (num.includes("-")) {
        num = num.split("-");
        return _.range(parseInt(num[0]), parseInt(num[1]) + 1);
      } else if (num.toLowerCase() == "latest") {
        return num;
      } else return null;
    });

    // Flattens the array, removes any values that isn't a number
    epNums = [...new Set(_.flattenDeep(epNums))].filter(Boolean);

    let epFromId = await slashInt.Bobb.VRV.getStream(
      epNums,
      initial,
      slashInt.slash.user.id
    );
    if (epFromId!.success === false) return `${epFromId.error!}`;
    let mediaEmbeds: Array<Discord.EmbedBuilder> = [];
    for (let ep in epFromId.epMedia!) {
      const shortenedURL: string = (epFromId.epMedia[ep].shortenedURL = (
        await axios.get(
          `https:\/\/tinyurl.com/api-create.php?url=${epFromId.epMedia[ep].streamURL}`
        )
      )?.data);
      let emb = new Discord.EmbedBuilder()
        .setColor(Math.floor(Math.random() * 0xffffff))
        .setTitle(
          `${slashInt.Bobb.VRV.cache[slashInt.slash.user.id]?.choiceTitle} | ${
            epFromId.epMedia[ep].epTitle
          }`
        )
        .setDescription(`Episode Number: ${ep}`)
        .addFields({
          name: `Stream URL: `,
          value: shortenedURL ?? epFromId.epMedia[ep].streamURL,
          inline: true,
        })
        .setTimestamp()
        .setFooter({
          text: `Requested by ${
            slashInt.slash.user.tag
          } | Time taken: ${slashInt.Bobb.utils.timeMilli(
            epFromId.epMedia[ep]!.timeTaken
          )}`,
        });
      person.latest = emb;
      mediaEmbeds.push(emb);
    }

    epFromId.message
      ? await epFromId.message.edit(
          `Finished! Total time taken: ${slashInt.Bobb.utils.timeMilli(
            Date.now() - st
          )}`
        )
      : await initial.edit(
          `Finished! Total time taken: ${slashInt.Bobb.utils.timeMilli(
            Date.now() - st
          )}`
        );
    slashInt.Bobb.VRV.setCacheEmbed(slashInt.slash.user.id, mediaEmbeds[0]);

    // @ts-ignore
    const epButtons: Discord.MessageButtonOptions[] = Object.keys(
      epFromId.epMedia
    ).map((streamNumber) => ({
      type: 2,
      label: streamNumber,
      style: "LINK",
      url: epFromId.epMedia[streamNumber].shortenedURL,
    }));
    const Ret = new slashInt.Bobb.Return(slashInt.Bobb, { Paginate: true });
    Ret.setEmbeds(mediaEmbeds).modernPaginate(slashInt, "Streams");
    //     .setButtons(epButtons)

    return Ret;
  }
);
