import "module-alias/register";

import express, { Request, Response } from "express";
const app = express();
import db from "../lib/db/mongoose";
import Bobb, { extClient } from "./bot/botClass";
import { GatewayIntentBits } from 'discord.js';
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import Stats from "../lib/db/models/Stats";
import Api from './webApi';2
import config from "./config.json";
import cookieParser from 'cookie-parser';
//import * as Sentry from "@sentry/node";

export default async function mainLaunch() {


    await db.connector();

 const client = new extClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildBans,
      GatewayIntentBits.GuildEmojisAndStickers,
      GatewayIntentBits.GuildIntegrations,
      GatewayIntentBits.GuildWebhooks,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
    ],
  });

  client.login(config.botToken!);
  const Swolly = new Bobb(client);
  await Swolly.deploy();

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


/* 
Sentry.init({
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