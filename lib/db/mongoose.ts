import mongoose, { ConnectOptions } from "mongoose";
import config from "../../src/config.json"
export default {
  async connector() {
    const dbOptions: ConnectOptions = {
      autoIndex: false,
      connectTimeoutMS: 10000,
      family: 4
    };
    await mongoose.connect(config.mongoPass!, dbOptions);
    mongoose.set("strictQuery", true);
    mongoose.Promise = global.Promise;
    mongoose.connection.on("connected", () => {
      console.log("Mongoose has successfully connected!");
    });
    mongoose.connection.on("err", (err: any) => {
      console.error(`Mongoose connection error: \n${err.stack}`);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("Mongoose connection lost");
    });
  }
};
