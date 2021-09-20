
import {MessageEmbed} from "discord.js";
import { executeArgs } from "lib/bot/botTypes";
import { Command } from "../../../../lib/bot/Command";
import { options } from '../../../config.json'
export default new Command(
  {
   name: "crchoose",
    description:
      `2/3: Choose an anime from ${options.prefix}crSearch. Response should be corresponding to the choice number.`,
    enableSlashCommand: false,
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
    let person = Swessage.Bobb.client.crCache[Swessage.author.id];
    if (!person)
      return `Please start by choosing an anime with the command \`${options.prefix}crSearch <term(s)>\``;
    let choice = person.choose(Swessage.args?.get("selection")?.value);

    if (choice.success === false) return `Error: ${choice.error}`;
    addCD?.();
    person = Swessage.Bobb.client.crCache[Swessage.author.id];
    let emb = new MessageEmbed()
      .setTitle(person.choiceTitle)
      .setDescription(`Success! The title ID is ${choice}`)
      .addField(
        `Final step command: ${options.prefix}crGetEp 2`,
        "This would fetch the 2nd episode of the anime."
      )
      .setFooter(
        "Make sure the selected anime episode of the season is correct!"
      )
      .setTimestamp()
      .setColor(Math.floor(Math.random() * 0xffffff));
    const Ret = new Swessage.Bobb.Return(Swessage.Bobb);
    Ret.setEmbeds([emb]);
    return Ret;
  });
