import { executeArgs } from "lib/bot/botTypes";
import { Command } from "../../../../lib/bot/Command";
import { Permissions, User } from "discord.js";
export default new Command(
  {
    name: "bypcd",
    description: "bypass cooldown for commands",
    clientPermissions: [
      Permissions.FLAGS.SEND_MESSAGES,
      Permissions.FLAGS.EMBED_LINKS,
    ],
    enableSlashCommand: true,
    args: [
      {
        id: "guy",
        type: "user",
        description: "user to to turn off cooldowns for",
        default: undefined,
        required: false
      }
    ],
    restrictTo: "guild",
    ownerOnly: true
  },
  async ({ Swessage }: executeArgs) => {
    const user = Swessage.args?.get("guy")?.user || Swessage.author;
    
    const success = await Swessage.Bobb.mongo.Person.toggleBypassCD((user as User).id);
    if(success) return `Successfully toggled cooldown bypass to \`${success}\` for ${user}!`
  else return "Unsuccessful.. is the user in the database?"
  })