import { executeArgs } from "lib/bot/botTypes";
import { Command } from "../../../../lib/bot/Command";
import { Permissions } from "discord.js";
import getGogo from '../../../../lib/utils/scrapers/gogo';
export default new Command(
  {
    name: "gogo",
    description: "fetches gogo stream using a given url. (`https://gogo-play.net`)",
    clientPermissions: [
      Permissions.FLAGS.SEND_MESSAGES,
      Permissions.FLAGS.EMBED_LINKS,
    ],
    enableSlashCommand: true,
    args: [
      {
        id: "link",
        type: "string",
        description: "gogo link (`https://gogo-play.net`)",
        default: undefined,
        required: true
      }
    ],
    cooldown: 8 * 1000,
    restrictTo: "all"
  },
  async ({ Swessage, addCD }: executeArgs) => {
    try {
      let mainURL = await getGogo(Swessage.args?.get("link")?.value!.toString() || '');
      if (mainURL) {
        addCD?.();
        return Swessage.Bobb.utils.decode64(mainURL.link);
      } else {
        throw new Error('unknown error 😮‍💨')
      }
    } catch (e) {
      return e.toString() || 'there was an error fetching with that link..'
    }
  })