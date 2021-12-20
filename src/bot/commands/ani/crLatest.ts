import { executeArgs } from "lib/bot/botTypes";
import { Command } from "../../../../lib/bot/Command";
export default new Command(
  {
    name: "crlink",
    description: "Use this command to get your latest episode fetch.",
    enableSlashCommand: true,
    cooldown: 6.5 * 1000
  },
  async ({ Swessage, addCD }: executeArgs) => {
    addCD?.();
    let person = Swessage.Bobb.client.crCache[Swessage.author.id];
    if (!person)
      return `Please start by choosing an anime with the command \`${Swessage.Bobb.config.options.prefix}crSearch <term(s)>\``;
    if (!person.latest) {
      return "at least fetch an episode first..";
    }
    const Ret = new Swessage.Bobb.Return(Swessage.Bobb)
    Ret.setEmbeds([person.latest]);
    return Ret;
  });
