import GenericCommand from "../../commandTypes/GenericCommand.js";
import { runFnArgs } from "../../../types/bot";
export default new GenericCommand(
  {
    triggers: ["verify"],
    minArgs: 1,
    usage: "{command} [UUID]",
    missingArgs: "Missing the UUID.",
    "description": "Verify your discord using the UUID on your website account.",
    dmOnly: true,
    cooldown: 4500
  },
  async ({ Bobb, message, args, addCD }: runFnArgs) => {
    if(!args || !args.length || args.length === 0) return `give me your UUID from your profile on <website soon>!`
    addCD();
    let pos = await Bobb!.mongo.Person.findOne({ UUID: args[0] });

    let upd = {
      discID: message!.author.id,
      discTag: message!.author.tag,
      verified: true
    };
    if (pos) {
      if (pos.discTag) return `You have already linked your Discord account.`;
      await Bobb!.db.updateMember({ UUID: args[0] }, upd);
      return `Verification successful. Thank you for linking!`;
    } else {
      return `Verification unsuccessful. Please find your UUID by going to the Website > Account > Discord`;
    }
  }
);
