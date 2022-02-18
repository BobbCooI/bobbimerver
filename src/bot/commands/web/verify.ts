import { executeArgs } from "lib/bot/botTypes";
import { Command } from "../../../../lib/bot/Command";
import { Permissions } from "discord.js";
export default new Command(
  {
    name: "verify",
    description: "Verify your discord using the UUID on your website account.",
    clientPermissions: [
      Permissions.FLAGS.SEND_MESSAGES,
      Permissions.FLAGS.EMBED_LINKS,
    ],
    enabled: false,
    enableSlashCommand: true,
    args: [
      {
        id: "uuid",
        type: "string",
        description: "uuid string from website",
        default: undefined,
        required: true
      }
    ],
    cooldown: 8 * 1000,
    restrictTo: "dm"
  },
  async ({ Swessage, addCD }: executeArgs) => {
    if(!Swessage.args || !Swessage.args?.size) return `give me your UUID from your profile on <website soon>!`
    addCD?.();
    let pos = await Swessage.Bobb.mongo.Person.findOne({ UUID: Swessage.args?.get("uuid")?.value });

    let upd = {
      discID: Swessage.author.id,
      discTag: Swessage.author.tag,
      verified: true
    };
    if (pos) {
      if (pos.discTag) return `You have already linked your Discord account.`;
      await Swessage.Bobb.db.updateMember({ UUID: Swessage.args?.get("uuid")?.value }, upd);
      return `Verification successful. Thank you for linking!`;
    } else {
      return `Verification unsuccessful. Please find your UUID by going to the Website > Account > Discord`;
    }
  }
);
