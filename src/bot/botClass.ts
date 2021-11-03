import messageCollector from "../../lib/utils/handlers/messageCollector";
import path from "path";
import Discord from "discord.js";
import ContextMenuCommand from "./commandTypes/ContextMenu";
/** Class Imports **/
import Person from "../../lib/db/models/Person";
import Guild from "../../lib/db/models/Guild";
import botDB from "../../lib/bot/botDB";
import Stats from "../../lib/db/models/Stats";
import config from "../config.json";
import botPackage from "../../package.json";
import VRV from "../../lib/utils/scrapers/vrv";
import Funi from "../../lib/utils/scrapers/funiClass";
import loggers from "../../lib/utils/logger";
import * as utils from "../../lib/utils/utils";
import * as constants from "../../lib/utils/constants";
import { Return } from "../../lib/bot/botTypes";
import ipc from '../IPC';
const { handleButton } = require("../../lib/utils/handlers/button");
const { handleContextMenu } = require("../../lib/utils/handlers/contextMenu");
const { handleSlashCommand } = require("../../lib/utils/handlers/slash")
import * as i18next from "i18next";
import { Command } from "../../lib/bot/Command";
import commandHandler from "../../lib/bot/CommandHandler";

// this shit has some weird import fuckery, this is the only way I can use it. <--- from fire bot. thx
const i18n = i18next as unknown as typeof i18next.default;
export class extClient extends Discord.Client {
  crCache: any;
  vrvCache: any;
  funiCache: any;
  opts: any;
  prefix: string;
  owners: Array<Discord.Snowflake>
  constructor(opts: any) {
    super(opts);
    this.crCache = {};
    this.vrvCache = {};
    this.funiCache = {};
    this.prefix = opts.prefix;
    this.owners = config.options.owners;
  }
}
/** Class Imports **/

export default class Bobb {
  client: extClient;
  cmds: Array<Command>
  slashCmds: Array<string>;
  contextMenus: Array<ContextMenuCommand>
  mongo: any;
  db: any;
  botStats: any;
  config: any;
  Crunchy: any;
  Funi: any;
  VRV: any;
  loggers: any;
  utils: any;
  handlers: {
    handleButton: typeof handleButton,
    handleSlashCommand: typeof handleSlashCommand,
    handleContextMenu: typeof handleContextMenu
  };
  commandHandler: commandHandler;
  constants: any;
  stats: any;
  cooldowns: any;
  mentionRX: RegExp;
  messageCollector: any;
  Return: typeof Return;
  ipc: any;
  i18n: typeof i18next.default;

  constructor(client: extClient) {
    /* declaring */
    this.client = client;
    this.ipc = new ipc;
    this.cmds = [];
    this.slashCmds = [];
    this.contextMenus = [];
    this.mongo = {
      Person,
      Guild
    };
    this.db = botDB(this);
    // TO DO REFRACTOR DB FUNCTIONS CODE
    this.botStats = Stats;
    this.config = config;
    this.VRV = new VRV(this, { lang: "enUS", debug: false, premium: true })
    this.Funi = Funi;
    this.loggers = loggers(this);
    this.utils = utils;
    this.constants = constants;
    this.handlers = {
      handleButton,
      handleSlashCommand,
      handleContextMenu
    };
    this.commandHandler = new commandHandler(this)
    this.i18n = i18n
    this.cooldowns = new Map();
    this.Return = Return;
    /* declaring */

  }

  async deploy(): Promise<void> {
    console.log("Deploying...");
    this.messageCollector = new messageCollector(this.client);
    this.client.on("ready", this.ready.bind(this));

    const listeners = (await import(path.join(__dirname, "events"))).default;
    // const raws = []

    for (const listener of listeners) {
      console.log(listener)
      if (listener.includes("_")) {
        this.client.ws.on(listener, require(path.join(__dirname, "events", listener)).handle.bind(this))
      } else {
        this.client.on(
          listener,
          require(path.join(__dirname, "events", listener)).handle.bind(this)
        );
      }
    }

  }

  async ready(): Promise<void> {
    let start = Date.now()
    await this.commandHandler.loadMessageCommands(false);
    //await this.commandHandler.loadInteractions({ guildId: "699487357400907867", cleanAll: true });
    const doneLoadCommands = Date.now() - start;
    const { client } = this;

    start = Date.now()
    this.loggers.logReady(
      `Ready: ${process.memoryUsage().rss / 1024 / 1024}MB`
    );
    await client.user!.setActivity(
      `bro`,
      { type: "WATCHING" }
    );
    const doneLog = Date.now() - start
    start = Date.now()
    await this.VRV.init();
    let auth = await this.VRV.auth();
    if (!auth!.success) throw new Error(`Oh no! Trouble vrv auth ${auth.error}`);
    const doneVRVAuth = Date.now() - start

    console.log("%c Time setups", "font-weight: bold; font-size: 50px; color: green", `
    [Commands Took]: ${this.utils.timeMilli(doneLoadCommands)}
    [Logging Took]: ${this.utils.timeMilli(doneLog)}
    [VRV Auth Took]: ${this.utils.timeMilli(doneVRVAuth)}
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

  createIPC(): void {
    this.ipc.register('reloadCommands', () => {
      for (const path in require.cache) {
        if (path.includes('bot/commands')) {
          delete require.cache[path];
        }
      }
      this.loggers.log('Commands reloaded probably');

      this.cmds = [];
      this.commandHandler.loadMessageCommands();
      this.commandHandler.loadInteractions({});

    });
    this.ipc.register('reloadMost', () => {
      for (const path in require.cache) {
        if (path.includes('utils') || path.includes('bot/commands') || path.includes('bot/commandTypes') || path.includes('bot/events')) {
          delete require.cache[path];
        }
      }
      this.cmds = [];
      this.commandHandler.loadMessageCommands();
      this.commandHandler.loadInteractions({});
      //   this.loadUtils();
      this.loggers.log('Most things reloaded probably');
    });
    this.ipc.register('reloadConfig', () => {
      for (const path in require.cache) {
        if (path.includes('config')) {
          delete require.cache[path];
        }
      }
      // this.config = require('./config.json');
      this.loggers.log('Config reloaded probably');
    });
  }
  get package() {
    return botPackage
  }
}
