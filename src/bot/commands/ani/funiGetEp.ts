import { executeArgs } from "lib/bot/discordThings";
import { Command } from "../../../../lib/bot/Command";
import Discord from "discord.js";
export default new Command(
  {
    category: "ani",

    slashOptions: {
      isSubCommand: true,
      groupName: "funi",
      commandOptions: new Discord.SlashCommandSubcommandBuilder()
        .setName("getep")
        .setDescription(
          `3/3 - Get the episodes of your choice from /funi choose. Usage can be 1, 1,2, 1-2, or 'latest'`
        )
        .addStringOption((option) =>
          option
            .setName("episodes")
            .setDescription("what you want ofc")
            .setRequired(true)
        ),
    },
    enabled: false,
    restrictTo: "guild",
    cooldown: 10 * 1000,
  },
  async ({ slashInt, addCD }: executeArgs) => {
    const st = Date.now();
    let person = slashInt.Bobb.client.funiCache[slashInt.slash.user.id];

    addCD?.();
    const gettingEps = await slashInt.send("Getting episodes...");
    let epFromId = await person.getEp(
      slashInt.slash.options.getString("episodes")
    );
    let streambeds: Array<Discord.EmbedBuilder> = [];
    if (epFromId.success === false) return `${epFromId.error}`;
    else {
      for (let ep in epFromId.res.epMedia) {
        if (epFromId.res.epMedia[ep].vData.success) {
          let emb = new Discord.EmbedBuilder()
            .setColor(Math.floor(Math.random() * 0xffffff))
            .setTitle(
              `${person.choiceTitle} | ${epFromId.res.epMedia[ep].episodeName}`
            )
            .setDescription(`Episode Number: ${ep}`)
            .addFields({
              name: `Stream URL: `,
              value: epFromId.res.epMedia[ep].vData.res.videoUrl,
              inline: true,
            })
            .setTimestamp()
            .setFooter({
              text: `Requested by ${
                slashInt.slash.user.tag
              } | Time taken: ${slashInt.Bobb.utils.timeMilli(
                epFromId.res.epMedia[ep].tTime
              )}`,
            });
          if (epFromId.res.epMedia[ep].vData.res.subsUrl)
            emb.addFields({
              name: `Subs URL: `,
              value: epFromId.res.epMedia[ep].vData.res.subsUrl,
              inline: true,
            });

          if (epFromId.res.epMedia[ep].vData.res.info)
            emb.addFields({
              name: `Info: `,
              value: epFromId.res.epMedia[ep].vData.res.info,
              inline: true,
            });

          person.latest = emb;
          streambeds.push(emb);
        } else if (epFromId.res.epMedia[ep].vData.res.success == false) {
          let emb = new Discord.EmbedBuilder()
            .setColor(Math.floor(Math.random() * 0xffffff))
            .setTitle(
              `${person.choiceTitle} | ${epFromId.res.epMedia[ep].episodeName}`
            )
            .addFields({
              name: "Error",
              value: epFromId.res.epMedia[ep].vData.error,
            })
            .setTimestamp()
            .setFooter({
              text: `Requested by ${
                slashInt.slash.user.tag
              } | Time taken: ${slashInt.Bobb.utils.timeMilli(
                epFromId.res.epMedia[ep].tTime
              )}`,
            });
          streambeds.push(emb);
        }
      }
    }

    await gettingEps.edit(
      `Finished! Total time taken: ${slashInt.Bobb.utils.timeMilli(
        Date.now() - st
      )}`
    );
    const Ret = new slashInt.Bobb.Return(slashInt.Bobb, { Paginate: true });
    Ret.setEmbeds(streambeds).modernPaginate(slashInt, "Streams");
    return Ret;
  }
);
