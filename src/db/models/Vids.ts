import { model, Schema, Document } from 'mongoose';
export interface iVid extends Document {
  vidUrl: string;
  title: string;
  aniTitle: string;
  timestamp: string;
}
const statSchema: Schema = new Schema({
  vidUrl: String,
  title: String,
  aniTitle: String,
  timestamp: Date
});

export default model<iVid>("epVideos", statSchema);