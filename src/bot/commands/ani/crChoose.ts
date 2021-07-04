import GenericCommand from "../../commandTypes/GenericCommand";
import Discord from "discord.js";
import { runFnArgs } from "../../../types/bot";
import { prefix } from "../../../utils/constants";
export default new GenericCommand(
  {
    triggers: ["crchoose", "cchoose", "crunchychoose"],
    usage: "{command} {choice}",
    description: `2/3 - Use this command to choose the anime from ${prefix}crSearch. Response should be the ordinal corresponding to the choices.`,
    slashCmd: true,
    slashOpts: {
      name: "crchoose",
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
  async ({ Bobb, message, addCD, argManager }: runFnArgs) => {
    let person = Bobb!.client.crCache[message!.author.id];
    if (!person)
      return `Please start by choosing an anime with the command \`${prefix}crSearch <term(s)>\``;
    let choice = person.choose((argManager!.args as string[])[0]);

    if (choice.success === false) return `Error: ${choice.error}`;
    addCD();
    person = Bobb!.client.crCache[message!.author.id];
    let emb = new Discord.MessageEmbed()
      .setTitle(person.choiceTitle)
      .setDescription(`Success! The title ID is ${choice}`)
      .addField(
        `Final step command: ${prefix}crGetEp 2`,
        "This would fetch the 2nd episode of the anime."
      )
      .setFooter(
        "Make sure the selected anime episode of the season is correct!"
      )
      .setTimestamp()
      .setColor(Math.floor(Math.random() * 0xffffff));
    const Ret = new Bobb!.Return("message");
    Ret.setEmbeds([emb]);
    return Ret;
  },
  async ({ Bobb, interaction, addCD, argslash }: runFnArgs) => {
    let person = Bobb!.client.crCache[interaction!.user.id];
    if (!person)
      return `Please start by choosing an anime with the command \`/crSearch <term(s)>\``;
    let choice = person.choose(argslash!.get("selection")!.value);

    if (choice.success === false) return `Error: ${choice.error}`;
    else {
      addCD();
      person = Bobb!.client.crCache[interaction!.user.id];
      let emb = new Discord.MessageEmbed()
        .setTitle(person.choiceTitle)
        .setDescription(`Success! The title ID is ${choice}`)
        .addField(
          `Final step command: /crGetEp 2`,
          "This would fetch the 2nd episode of the anime."
        )
        .setFooter(
          "Make sure the selected anime episode of the season is correct!"
        )
        .setTimestamp()
        .setColor(Math.floor(Math.random() * 0xffffff));
      const Ret = new Bobb!.Return("interaction");
      Ret.setEmbeds([emb]);
      return Ret;
    }
  }
);
