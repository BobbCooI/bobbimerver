import { executeArgs } from "lib/bot/discordThings";
import { Command } from "../../../../lib/bot/Command";
import { SlashCommandBuilder } from "discord.js";
export default new Command(
  {
    category: "web",
    slashOptions: {
      commandOptions: new SlashCommandBuilder()
        .setName("verify")
        .setDescription(
          "Verify your discord using the UUID on your website account."
        )
        .addStringOption((option) =>
          option
            .setName("uuid")
            .setDescription("uuid string from website")
            .setRequired(true)
        )
        .setDMPermission(true),
    },
    enabled: false,
    cooldown: 8 * 1000,
    restrictTo: "dm",
  },
  async ({ slashInt, addCD }: executeArgs) => {
    addCD?.();
    const userUUID = slashInt.slash.options.getString("uuid");
    let pos = await slashInt.Bobb.mongo.Person.findOne({ UUID: userUUID });

    let upd = {
      discID: slashInt.slash.user.id,
      discTag: slashInt.slash.user.tag,
      verified: true,
    };
    if (pos) {
      if (pos.discTag) return `You have already linked your Discord account.`;
      await slashInt.Bobb.db.updateMember({ UUID: userUUID }, upd);
      return `Verification successful. Thank you for linking!`;
    } else {
      return `Verification unsuccessful. Please find your UUID by going to the Website > Account > Discord`;
    }
  }
);
