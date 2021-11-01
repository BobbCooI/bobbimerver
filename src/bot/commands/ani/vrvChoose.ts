import Discord from "discord.js";
import { executeArgs } from "lib/bot/botTypes";
import { Command } from "../../../../lib/bot/Command";
import { options } from '../../../config.json'
export default new Command(
  {
   name: "vrvchoose",
    description:
      `2/3: Choose an anime from ${options.prefix}vrvSearch. Response should be corresponding to the choice number.`,
    enableSlashCommand: true,
      args: [
        {
          id: "selection",
          type: "number",
          description: "List a number from the choices you received.",
          default: undefined,
          required: true
        }
      ],
    cooldown: 5 * 1000
  },
  async ({Swessage, addCD }: executeArgs) => {
        if(!(Swessage.args?.get("selection")?.value)) return `pick something to choose 🙄`
    let person = Swessage.Bobb.VRV.cache[Swessage.author.id];
    if (!person)
      return `Please start by choosing an anime with the command \`${options.prefix}vrvSearch <term(s)>\``;
    let choice = await Swessage.Bobb.VRV.choose(Swessage.args?.get("selection")?.value, Swessage.author.id);

    if (choice.success === false) return `Error: ${choice.error}`;
    addCD?.();
    let embeds = [];
    let start = 0;
    let end = 20;
    for (let i = 0; i < Math.ceil(choice.res.length / 20); i++) {
      const emb = new Discord.MessageEmbed()
        .setTitle(choice.title)
        .setAuthor(Swessage.author.tag, Swessage.author.displayAvatarURL())
        .setDescription(choice.res.slice(start, end).join('\n'))
        .setFooter(
          `\"vrvGetEp 2\" to get the second episode.`
        )
        .setTimestamp()
        .setColor(Math.floor(Math.random() * 0xffffff));
      start += 20;
      end += 20;
      embeds.push(emb);
    }
    if (embeds.length === 1) {
      const Ret = new Swessage.Bobb.Return(Swessage.Bobb)
      Ret.setEmbeds(embeds);
      return Ret;
    }
    const Ret= new Swessage.Bobb.Return(Swessage.Bobb, {Paginate: true});
    Ret
      .setEmbeds(embeds)
      .modernPaginate(
        Swessage,
        `Selection could be "${options.prefix}vrvGetEp <${
          choice.res[1].split(" ")[0]
        } | ${choice.res[1]
          .split(" ")[0]
          .slice(0, -2)}> to get the second episode.`
      );
      return Ret;
  })
