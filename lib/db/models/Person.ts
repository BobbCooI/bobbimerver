import { model, Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import config from "../../../src/config.json"
//import { String } from "lodash";
export interface animeWatch {
  // Anime Info
  title: string;
  episodeCount: number;
  rating: number;

  // User Info About Anime
  episodes: Array<episode>;
  start: Date;
  end?: Date;
  finished?: boolean;
  userRating?: number;
}
export interface episode {
  aniTitle: string;
  title: string;
  num: number;
  timeBegan: Date;
  length?: number;
  timestampOn?: number;
  userRating?: number;
  finished?: boolean;
}
export interface iUser {
  // Website Stuff
  username: string;
  loweruser: string;
  userID: string;
  email: string;
  ePassword: string;
  hPassword: string;
  UUID: string;
  dateCreate: Date;

  // User Anime Watch Stuff for WEBSITE
  episodesFetched?: number;
  animeTitlesViewed?: Array<string>;
  animesWatch?: Array<animeWatch>;
  animeEpisodes?: Array<episode>;

  // Discord Stuff
  verified: boolean;
  discTag?: string;
  discID?: string;
  cmdsRan?: number;
  lastCmd?: string;
  cmdSpam?: number;
  bypassCooldown?: boolean;
  powerful?: boolean;
}

export interface iUserMethods extends iUser, Document {
  comparePassword(password: string): Promise<any>;
}
export interface iUserModel extends Model<iUserMethods> {
  toggleBypassCD(user: string): Promise<null | string>;
}
const userSchema: Schema<iUserMethods & iUserModel> = new Schema({
  // Website
  username: { type: String },
  loweruser: { type: String },
  userID: { type: String },
  email: { type: String },
  ePassword: { type: String },
  hPassword: { type: String },
  UUID: { type: String },
  dateCreate: { type: Date },

  // User Anime Watch Stuff
  episodesFetched: { type: Number },
  animeTitlesViewed: { type: Array },
  animesWatch: { type: Array },
  animeEpisodes: { type: Array },

  // Discord Stuff
  verified: { type: Boolean },
  discTag: { type: String },
  discID: { type: String },
  cmdSpam: { type: Number },
  cmdsRan: { type: Number },
  lastCmd: { type: Date },
  bypassCooldown: { type: Boolean, default: false },
  powerful: { type: Boolean, default: false }
});
userSchema.pre<iUserMethods>("save", function (next: any) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("hPassword")) return next();

  // generate a salt
  bcrypt.genSalt(parseInt(config.saltFactor!) || 6, function (
    err: any,
    salt
  ) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.hPassword, salt, function (err: any, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.hPassword = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.hPassword);
};

userSchema.statics.toggleBypassCD = async function (user: string): Promise<null | string> {
  const getPerson = await this.findOne({ discID: user });
  if (!getPerson) return null;
  else await this.updateOne({ discID: user }, { $set: { bypassCooldown: !getPerson.bypassCooldown } });
  return (!getPerson.bypassCooldown).toString();
}
export default model<iUserMethods & iUserModel>("user", userSchema);
