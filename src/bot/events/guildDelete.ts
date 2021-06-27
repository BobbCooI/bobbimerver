import { Guild } from "discord.js";

exports.handle = async function(guild: Guild) {
  await this.mongo.Guild.deleteGuild(guild);
};
