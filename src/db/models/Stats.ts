import { model, Schema, Document } from 'mongoose';
export interface iStats extends Document {
  usersCreated: number;
    usersVerified: number;
  messages: number;
  commands: number;
  slashCommands: number;
  guildsJoined: number;
  guildsLeft: number;
  errReported: number;
  err: number;
  websiteVisits: number;
  webRequests: number;
  episodesFetched: number;
}
const statSchema: Schema = new Schema({
  usersCreated: {type: Number, default: 0}, // WEBSITE ACCOUNTS
  usersVerified: {type: Number, default: 0}, // DISCORD VERIFIED IN SERVER
  messages: {type: Number, default: 0},
  commands: {type: Number, default: 0},
  slashCommands: {type: Number, default: 0},
  guildsJoined: {type: Number, default: 0},
  guildsLeft: {type: Number, default: 0},
  errReported: {type: Number, default: 0},
  err: {type: Number, default: 0},
  websiteVisits: {type: Number, default: 0},
  webRequests: {type: Number, default: 0},
  episodesFetched: {type: Number, default: 0}
});

export default model<iStats>("botStats", statSchema);