import { model, Schema, Document } from 'mongoose';
export interface iSustain extends Document {
  reqLink: string;
  reqHash: string;
  aniID: string;
  updHash: string;
}
const sustainSchema: Schema = new Schema({
  reqLink: String,
  reqHash: String,
  aniID: String,
  updHash: String
});

export default model<iSustain>("Sustain", sustainSchema);