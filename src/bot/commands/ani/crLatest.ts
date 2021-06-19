import GenericCommand from "../../commandTypes/GenericCommand";
import { runFnArgs } from "../../../types/bot";
import { prefix } from '../../../utils/constants'
export default new GenericCommand(
  {
    triggers: ["crlatest", "crlate", "crla"],
    usage: "{command}",
    description: "Use this command to get your latest episode fetch.",
    slashCmd: false,
    slashOpts: {
      name: "crLatest",
      description: "Get your latest episode fetch."
    },
    cooldown: 6.5 * 1000
  },
  async ({ Bobb, message, addCD }: runFnArgs) => {
    addCD();
    let person = Bobb!.client.crCache[message!.author.id];
    if (!person)
      return `Please start by choosing an anime with the command \`${prefix}crSearch <term(s)>\``;
    if (!person.latest) {
      return "at least fetch an episode first..";
    }
    const Ret = new Bobb!.Return("message")
    Ret.setEmbeds([person.latest]);
    return Ret;
  },
  async ({ Bobb, addCD, interaction }: runFnArgs) => {
    addCD();
    let person = Bobb!.client.crCache[interaction!.user.id];
    if (!person)
      return `Please start by choosing an anime with the command \`/crSearch <term(s)>\``;
    if (!person.latest) {
      return "at least fetch an episode first..";
    }
    const Ret = new Bobb!.Return("interaction")
    Ret.setEmbeds([person.latest]);
    return Ret;
  }
);
