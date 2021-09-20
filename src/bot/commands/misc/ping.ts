import { executeArgs } from "lib/bot/botTypes";
import { Command } from "../../../../lib/bot/Command";
import { Permissions } from "discord.js"
export default new Command(
  {
    name: "ping",
    description: "check bot ping",
    clientPermissions: [
      Permissions.FLAGS.SEND_MESSAGES,
      Permissions.FLAGS.EMBED_LINKS,
    ],
    aliases: ["pong"],
    enableSlashCommand: true,
    restrictTo: "all"
  },
  async ({ Swessage }: executeArgs) => {
    const ret = new Swessage.Bobb.Return(Swessage.Bobb);
    ret.setContent(`🏓 Pong! ${Date.now() - Swessage.createdTimestamp}ms`)
    return ret;
  })
