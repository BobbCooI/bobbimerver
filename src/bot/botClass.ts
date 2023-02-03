import messageCollector from "../../lib/utils/handlers/messageCollector";
import path from "path";
import Discord, { ActivityType } from "discord.js";
import {Configuration, OpenAIApi} from "openai";
/** Class Imports **/
import Person from "../../lib/db/models/Person";
import Guild from "../../lib/db/models/Guild";
import botDB from "../../lib/bot/botDB";
import Stats from "../../lib/db/models/Stats";
import config from "../config.json";
import VRV from "../../lib/utils/scrapers/vrv/VRV";
import Funi from "../../lib/utils/scrapers/funiClass";
import loggers from "../../lib/utils/logger";
import * as utils from "../../lib/utils/utils";
import * as constants from "../../lib/utils/constants";
import { Return } from "../../lib/bot/discordThings";
const { handleSlashCommand } = require("../../lib/utils/handlers/slash")
import { Command } from "../../lib/bot/Command";
import commandHandler from "../../lib/bot/CommandHandler";
import DiscordVRV from "@lib/utils/scrapers/vrv/discordVRV";

export class extClient extends Discord.Client {
  vrvCache: any;
  funiCache: any;
  opts: any;
  owners: Array<Discord.Snowflake>
  constructor(opts: any) {
    super(opts);
    this.vrvCache = {};
    this.funiCache = {};
    this.owners = config.options.owners;

  }
}
/** Class Imports **/

export default class Bobb {
  client: extClient;
  slashCommands: Array<Command>;
  mongo: any;
  db: any;
  botStats: any;
  config: any;
  Funi: any;
  discordVRV: DiscordVRV;
  loggers: any;
  utils: any;
  openai: OpenAIApi;
  handlers: {
    handleSlashCommand: typeof handleSlashCommand,
  };
  commandHandler: commandHandler;
  constants: any;
  stats: any;
  cooldowns: any;
  mentionRX: RegExp;
  messageCollector: any;
  Return: typeof Return;

  constructor(client: extClient, VRV: VRV) {
    /* declaring */
    this.client = client;
    this.slashCommands = [];
    this.mongo = {
      Person,
      Guild
    };
    this.db = botDB(this);
    // TO DO REFRACTOR DB FUNCTIONS CODE
    this.botStats = Stats;
    this.config = config;
    this.discordVRV = new DiscordVRV(this, VRV);

    this.Funi = Funi;
    this.loggers = loggers(this);
    this.utils = utils;
    this.constants = constants;

    this.openai = new OpenAIApi( new Configuration({ apiKey: config.OPENAI_API_KEY}))
    this.handlers = {
      handleSlashCommand,
    };
    this.commandHandler = new commandHandler(this)
    this.cooldowns = new Map();
    this.Return = Return;
    /* declaring */

  }

  async deploy(): Promise<Bobb> {
    console.log("[ Deploying... ]");
    this.messageCollector = new messageCollector(this.client);
    this.client.on("ready", this.ready.bind(this));

    const listeners = (await import(path.join(__dirname, "events"))).default;
    // const raws = []

    for (const listener of listeners) {
      console.log(`[ Loaded ] ${listener}`);
      if (listener.includes("_")) {
        this.client.ws.on(listener, require(path.join(__dirname, "events", listener)).handle.bind(this))
      } else {
        this.client.on(
          listener,
          require(path.join(__dirname, "events", listener)).handle.bind(this)
        );
      }
    }
    return this;

  }

  async ready(): Promise<void> {
    let start = Date.now()
    await this.commandHandler.populateCommands();

    // ONLY RUN THIS WHEN THERE IS A CHANGE TO THE SLASH COMMANDS
    //await this.commandHandler.cleanAndLoadInts(["all"]);
  

    const doneLoadCommands = Date.now() - start;
    const { client } = this;

    start = Date.now()
    this.loggers.logReady(
      `Ready: ${process.memoryUsage().rss / 1024 / 1024}MB`
    );
    await client.user!.setActivity(
      `with jit`,
      { type: ActivityType.Competing }
    );
    const doneLog = Date.now() - start
 
    
    console.log("%c Time setups", "font-weight: bold; font-size: 50px; color: green", `
    [Commands Took]: ${this.utils.timeMilli(doneLoadCommands)}
    [Logging Took]: ${this.utils.timeMilli(doneLog)}
    `);
    console.log(`Ready for action ❣️`)
  }

  _sweepCooldowns(): void {
    for (const [key, value] of this.cooldowns) {
      let activeCooldowns = [];
      for (const cooldown of value.cooldowns) {
        if (cooldown[Object.keys(cooldown)[0]] > Date.now()) {
          activeCooldowns.push(cooldown);
        }
      }
      if (!activeCooldowns[0]) {
        this.cooldowns.delete(key);
      } else if (activeCooldowns.length !== value.cooldowns.length) {
        this.cooldowns.set(key, {
          cooldowns: activeCooldowns,
          id: key
        });
      }
    }
  }

}
