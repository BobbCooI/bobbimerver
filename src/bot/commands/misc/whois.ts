import { executeArgs } from "lib/bot/botTypes";
import { Command } from "../../../../lib/bot/Command";
import {Permissions, MessageEmbed, User} from "discord.js"
export default new Command(
  {
    name: "whois",
    description: "see who someone is",
    clientPermissions: [
        Permissions.FLAGS.SEND_MESSAGES,
        Permissions.FLAGS.EMBED_LINKS,
    ],
    args: [ {
        id: "user",
        type: "user",
        default: undefined,
        required: false,
    }],
    enableSlashCommand: true,
    restrictTo: "all"
  },
  async ({ Swessage }: executeArgs) => {
    const ret = new Swessage.Bobb.Return(Swessage.Bobb);
    const person = Swessage.args?.get("user")?.user as User || Swessage.author;

    let userInfoEmbed = new MessageEmbed()
    userInfoEmbed.setAuthor(person.tag)
    userInfoEmbed.setImage(person.displayAvatarURL());
    userInfoEmbed.setTimestamp()
    
    ret.setEmbeds([userInfoEmbed]);
    return ret;
  })
