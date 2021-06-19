import { model, Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

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
  dateCreate: string;
  
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
}

export interface iUserModel extends iUser, Document {
  comparePassword(password: string): Promise<any>;
}

const userSchema: Schema<iUserModel> = new Schema({
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
  lastCmd: { type: Date }
});
userSchema.pre<iUserModel>("save", function(next: any) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("hPassword")) return next();

  // generate a salt
  bcrypt.genSalt(parseInt(process.env.saltFactor!) || 6, function(
    err: any,
    salt
  ) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.hPassword, salt, function(err: any, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.hPassword = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = async function(
  password: string
): Promise<any> {
  return bcrypt.compare(password, this.hPassword);
};

export default model<iUserModel>("user", userSchema);
