import { model, Schema, Document } from 'mongoose';

export interface iGuild extends Document {
  guild: string;
  guildID: string;
  prefix: string;
  disabledCategories:string[];
  disabledCommands:string[];
  enabledCommands:string[];
}
const guildSchema = new Schema({
  guild: { type: String, required: true },
  guildID: { type: String, required: true },
  prefix: { type: String, default: "a!" },
  disabledCategories: {type: Array, default: []},
  disabledCommands: {type: Array, default: []},
  enabledCommands: {type: Array, default: []}
});
export default model<iGuild>("Guild", guildSchema);