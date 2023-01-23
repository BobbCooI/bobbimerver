import { model, Model, Schema, Document } from 'mongoose';
import { Guild } from 'discord.js';
export interface iGuild extends Document {
  guild: string;
  guildID: string;
  disabledCategories: string[];
  disabledCommands: string[];
  enabledCommands: string[];
}
export interface iGuildModel extends Model<iGuild> {
  createGuild(guild: Guild): Promise<iGuild>;
  getGuild(id: string, update?: any): Promise<iGuild>;
  createGuild(guild: Guild): Promise<iGuild>;
}
const guildSchema = new Schema({
  guild: { type: String, required: true },
  guildID: { type: String, required: true },
  disabledCategories: { type: Array, default: [] },
  disabledCommands: { type: Array, default: [] },
  enabledCommands: { type: Array, default: [] }
});
guildSchema.statics.createGuild = async function(guild: Guild): Promise<iGuild> {
  //@ts-ignore
  return this.create({ guild: guild.name, guildID: guild.id })
}
guildSchema.statics.getGuild = async function (id: string, update?: any): Promise<iGuild> {
  return id && !update ? this.findOne({ guildID: id }).catch((e: any) => console.log(e)) : this.findOneAndUpdate({ guildID: id }, update, { new: true }).catch((e: any) => console.log(e.stack + e.message + "function: getGuild->findOne", "error"));
}
guildSchema.statics.deleteGuild = async function (guild: Guild): Promise<iGuild> {
  return this.findOneAndDelete(
    { guildID: guild.id }).catch((e: any) => console.log(e.stack.length < 1990 ? e.stack : e.message + "function: deleteGuild->findOneAndDelete guild", "error"));
}
export default model<iGuildModel>("Guild", guildSchema);