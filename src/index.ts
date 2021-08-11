import express, { Request, Response } from "express";
const app = express();
import db from "./db/mongoose";
import Bobb, { extClient } from "./bot/botClass";
import { Intents } from 'discord.js';

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import Stats from "./db/models/Stats";
import Api from './api';
import config from "./config.json";
import cookieParser from 'cookie-parser';
//import Sentry from "@sentry/node";
//import Tracing from "@sentry/tracing";

export default async function mainLaunch() {


    await db.connector();

 const client = new extClient({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_BANS,
      Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
      Intents.FLAGS.GUILD_INTEGRATIONS,
      Intents.FLAGS.GUILD_WEBHOOKS,
      Intents.FLAGS.GUILD_INVITES,
      Intents.FLAGS.GUILD_VOICE_STATES,
      Intents.FLAGS.GUILD_PRESENCES,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILD_MESSAGE_TYPING,
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
      Intents.FLAGS.DIRECT_MESSAGE_TYPING
    ],
    prefix: config.prefix
  });

  client.login(config.botToken!);
  const Asuna = new Bobb(client);
  await Asuna.deploy();

  app.set("trust proxy", 1);
  app.use(
    morgan(
      ":method | :url | :status :response-time ms | Content length - :res[content-length] | ip - :remote-addr | header - :req[header]"
    )
  );
  app.use(helmet());
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use((_req, _res, next) => {
    next();
  }, cors({ maxAge: 84600 }));
  app.use("/api", Api);
  app.use("/", async (_req: Request, _res: Response, next: any) => {
     Stats.updateOne(
      { _id: "60070be0f12d9e041931de68" },
      { $inc: { webRequests: 1 } }
    );
    next();
  });
  
  
  let port = 3000;
  app.listen(port, () => {
    console.log("❇️ Express server is running on port", port);
  });

  app.get("/", (_req: Request, res: Response) => {
    res.send("Hello World!");
  });


}
mainLaunch();


/*Sentry.init({
  dsn: process.env.sentryURL!,
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
});

const transaction = Sentry.startTransaction({
  op: "launch",
  name: "bobbime server launch"
});

setTimeout(() => {
  try {
    mainLaunch();
  } catch (e) {
    Sentry.captureException(e);
  } finally {
    transaction.finish();
  }
}, 99);
*/