import GenericCommand from "../../commandTypes/GenericCommand";
import { runFnArgs } from '../../../types/bot';
import { MessageButton } from 'discord.js';
export default new GenericCommand(
  {
    triggers: ["ping", "pong"],
    usage: "{command}",
    description: "Check my ping..",
    bypass: true,
    slashCmd: true,
    slashOpts: {
      name: "ping",
      description: "Check my ping.."
    }
  },
  async ({ Bobb, message }: runFnArgs) => {
   const ret = new Bobb!.Return("message");
ret
.setContent(`🏓 Pong! ${Date.now() - message!.createdTimestamp}ms`)
.setComponents([
    new MessageButton({type: 2,
    label: "lol",
    style:"PRIMARY",
    customID: "pong"
    })
    ]);
return ret;
  },
  async ({
  Bobb,
    interaction
  }: runFnArgs) => {
    const ret = new Bobb!.Return("interaction");
    ret.setContent(`🏓 Slash Command Pong! ${Date.now() -
      interaction!.createdTimestamp!}ms`);
      return ret;
  }
);
