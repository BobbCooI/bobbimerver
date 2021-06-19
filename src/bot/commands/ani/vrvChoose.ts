import GenericCommand from "../../commandTypes/GenericCommand";
import Discord from "discord.js";
import { runFnArgs } from "../../../types/bot";
import { prefix } from '../../../utils/constants'
export default new GenericCommand(
  {
    triggers: ["vrvchoose", "vchoose"],
    usage: "{command} {choice}",
    description:
      `2/3 - Use this command to choose the anime from ${prefix}vrvSearch. Response should be corresponding to the choice number.`,
    slashCmd: true,
    slashOpts: {
      name: "vrvchoose",
      description:
        "Use this command to choose an anime from the search results.",
      options: [
        {
          type: 4,
          name: "selection",
          description: "List a number from the choices you received.",
          required: true
        }
      ]
    },
    cooldown: 5 * 1000
  },
  async ({ Bobb, message, addCD, args }: runFnArgs) => {
        if(!args ?? !((args as Array<string>).length)) return `pick something to choose 🙄`
    let person = Bobb!.VRV.cache[message!.author.id];
    if (!person)
      return `Please start by choosing an anime with the command \`${prefix}vrvSearch <term(s)>\``;
    let choice = await Bobb!.VRV.choose((args as string[])[0], message!.author.id);

    if (choice.success === false) return `Error: ${choice.error}`;
    addCD();
    let embeds = [];
    let start = 0;
    let end = 20;
console.log(choice.res, typeof choice.res)
    for (let i = 0; i < Math.ceil(choice.res.length / 20); i++) {
      const emb = new Discord.MessageEmbed()
        .setTitle(choice.title)
        .setAuthor(message!.author.tag, message!.author.displayAvatarURL())
        .setDescription(choice.res.slice(start, end).join('\n'))
        .setFooter(
          `Selection could be ${prefix}vrvGetEp \`${
            choice.res[1].split(" ")[0]
          }\` or \`${choice.res[1]
            .split(" ")[0]
            .slice(0, -2)}\` to get the second episode.`
        )
        .setTimestamp()
        .setColor(Math.floor(Math.random() * 0xffffff));
      start += 20;
      end += 20;
      embeds.push(emb);
    }
    if (embeds.length === 1) {
      const Ret = new Bobb!.Return("message")
      Ret.setEmbeds(embeds);
      return Ret;
    }
    const Ret= new Bobb!.Return("message", {Paginate: true});
    Ret
      .setEmbeds(embeds)
      .Paginator(
        message!,
        `Selection could be "${prefix}vrvGetEp <${
          choice.res[1].split(" ")[0]
        } | ${choice.res[1]
          .split(" ")[0]
          .slice(0, -2)}> to get the second episode.`
      );
      return Ret;
  },
  async ({ Bobb, interaction, argslash }: runFnArgs) => {
    let person = Bobb!.VRV.cache[interaction!.user.id];
    if (!person)
      return `Please start by choosing an anime with the command \`${prefix}vrvSearch <term(s)>\``;
    let choice = await Bobb!.VRV.choose(argslash!.get("selection")!.value, interaction!.user.id);

    if (choice.success === false) return `Error: ${choice.error}`;
    let embeds = [];
    let start = 0;
    let end = 20;
    console.log(choice);
    for (let i = 0; i < Math.ceil(choice.res.length / 20); i++) {
      const emb = new Discord.MessageEmbed()
        .setTitle(choice.title)
        .setAuthor(
          `${interaction!.user.username}#${interaction!.user.discriminator}`,
          `https:\/\/cdn.discordapp.com/avatar/${interaction!.user.id}/${interaction!.user.avatar}.png`
        )
        .setDescription(choice.res.slice(start, end).join('\n'))
        .setFooter(
          `Selection could be "${prefix}vrvGetEp ${
            choice.res[1].split(" ")[0]
          }" or "${choice.res[1]
            .split(" ")[0]
            .slice(0, -2)}" to get the second episode.`
        )
        .setTimestamp()
        .setColor(Math.floor(Math.random() * 0xffffff));
      start += 20;
      end += 20;
      embeds.push(emb);
    }
    if (embeds.length === 1) return embeds[0];
    const Ret = new Bobb!.Return("interaction")
Ret.setEmbeds(embeds);//.Paginator(message, `Selection could be "c!vrvGetEp <${choice.res[1].split(' ')[0]} | ${choice.res[1].split(' ')[0].slice(0, -2)}> to get the second episode.`);
 return Ret;
}
);
