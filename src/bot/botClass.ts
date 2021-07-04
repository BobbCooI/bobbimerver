import messageCollector from "./handlers/messageCollector";
import fs from "fs";
import path from "path";
import Discord from "discord.js";
import GenericCommand from "./commandTypes/GenericCommand";
/** Class Imports **/
import Person from "../db/models/Person";
import Guild from "../db/models/Guild";
import botDB from "../utils/botDB";
import Stats from "../db/models/Stats";
import config from "../config.json";
import botPackage from "../../package.json";
import VRV from "../utils/scrapers/vrv";
import Funi from "../utils/scrapers/funiClass";
import loggers from "../utils/logger";
import misc from "../utils/botMisc";
import * as utils from "../utils/utils";
import * as constants from "../utils/constants";
import { Return } from "../types/bot";
import ipc from '../IPC';
import StatsD from 'hot-shots';
export class extClient extends Discord.Client {
  crCache: any;
  vrvCache: any;
  funiCache: any;
  opts: any;
  prefix: string;
  constructor(opts: any) {
    super(opts);
    this.crCache = {};
    this.vrvCache = {};
    this.funiCache = {};
    this.prefix = opts.prefix;
  }
}
/** Class Imports **/

export default class Bobb {
  client: extClient; //class pubApi implements Discord.Client {public api: object;};
  cmds: Array<GenericCommand>;
  slashCmds: Array<string>;
  mongo: any;
  db: any;
  botStats: any;
  config: any;
  Crunchy: any;
   Funi: any;
  VRV: any;
  loggers: any;
  misc: any;
  utils: any;
  constants: any;
  stats: any;
  cooldowns: any;
  mentionRX: RegExp;
  messageCollector: any;
  Return: typeof Return;
  ipc: any;
  constructor(client: extClient) {
    this.client = client;
    this.ipc = new ipc;
    this.cmds = [];
    this.slashCmds = [];
    this.mongo = {
      Person,
      Guild
    };
    this.db = botDB(this);
    // TO DO REFRACTOR DB FUNCTIONS CODE
    this.botStats = Stats;
    this.config = config;
    this.VRV = new VRV(this, {lang: "enUS", debug: true, premium: true})
    this.Funi = Funi;
    this.loggers = loggers(this);
    //  this.helpers = require('./utils/dbFunctions.js')(this);
    this.misc = misc(this);
    this.utils = utils;
    this.constants = constants;
    this.stats = new StatsD({
          port: 8020,
          globalTags: ["anime", "misc", "web"],
          errorHandler: function(error) {
            console.log("Stats error: " + error);
          }
      });
    this.cooldowns = new Map();
    this.Return = Return;
  }

  async deploy(): Promise<void> {
   console.log("Deploying...");
    this.messageCollector = new messageCollector(this.client);
    this.client.on("ready", this.ready.bind(this));

    const listeners =( await import( path.join(__dirname, "events"))).default
    for (const listener of listeners) {
        this.client.on(
          listener,
          require(path.join(__dirname, "events", listener)).handle.bind(this)
        );
    }
    
  }

  async ready(): Promise<void> {
    await this.loadCommands();

    const { client } = this;

    this.loggers.logReady(
      `Ready: ${process.memoryUsage().rss / 1024 / 1024}MB`
    );

    await client.user!.setActivity(
      `bro`,
      { type: "WATCHING" }
    );
   this.mentionRX = /<@!*747231069002006609>/g;
  /*  this.mockIMG = await this.http
      .get("https://pbs.twimg.com/media/DAU-ZPHUIAATuNy.jpg")
      .then(r => r.body);*/
  /*  client.crCache = {};
    client.vrvCache = {};
    client.funiCache = {};*/
    this.cmds.forEach(cmd => {
      console.log(cmd.category);
    });
await this.VRV.init();
let auth = await this.VRV.auth();
    if (!auth!.success) throw new Error(`Oh no! Trouble vrv auth ${auth.error}`);
    console.log("Ready for action ❣️");

  }
  async loadCommands(): Promise<void> {
    const categories = fs.readdirSync(path.join(__dirname, "commands"));
await this.utils.asyncForEach(categories, async(categoryPath: string) => {
  let category = (await import(path.join(__dirname, "commands", categoryPath))).default;//.catch((e: any) => console.log(e))).default;
 category.commands = await Promise.all(category.commands.map(async (command:any): Promise<GenericCommand> => {
    let elCmd = await command;
    return elCmd.default;
   })).catch((e: any) => console.log(e))
 
  for (let command of category.commands) {
       command.category = category.name;
        command.description = category.description;
        this.cmds.push(command);
      }
})
  
await this.loadInteractions();
   /* let e = await this.client.api
      .applications(this.client.user.id)
      .commands.put({
        data: this.cmds
          .map(c => {
            return c.props.slashCmd
              ? {
                  name: c.props.slashOpts.name.toLowerCase(),
                  description: c.props.slashOpts.description,
                  options: c.props.slashOpts.options
                    ? c.props.slashOpts.options
                    : []
                }
              : false;
          })
          .filter(c => c)
      });
    e.forEach(cmd => this.slashCmds.push(cmd.name));
    console.log(this.slashCmds);
    
    let slashCmds = await this.client.api.applications(this.client.user.id).guilds('699487357400907867').commands.get();
slashCmds.forEach(async cmd => {
  if(!this.cmds.find(nor => (nor.props.slashCmd && nor.props.slashOpts.name) === cmd.name)) await this.utils.cmdReq.delete(`/${cmd.id}`);
}); ONLY IF I EVERY WANT TO DELETE A COMMAND */
  }
  async loadInteractions() {
    const mappedSlashCmds = this.cmds!
          .filter((c: GenericCommand )=> c.props.slashCmd && c.props.slashOpts?.name)
          .map((c: GenericCommand) => ({
                  name: c.props.slashOpts!.name.toLowerCase(),
                  description: c.props.slashOpts!.description,
                  options: c.props.slashOpts?.options
                    ? c.props.slashOpts.options
                    : []
                }));
  let e = await this.client
      .application!
      .commands
      .set(mappedSlashCmds)
    e.forEach(cmd => this.slashCmds.push(cmd.name));
    console.log(this.slashCmds);
    /*let slashCmds = await this.client.api.applications(this.client.user.id).guilds('699487357400907867').commands.get();
slashCmds.forEach(async cmd => {
  if(!this.cmds.find(nor => (nor.props.slashCmd && nor.props.slashOpts.name) === cmd.name)) await this.utils.cmdReq.delete(`/${cmd.id}`);
}); ONLY IF I EVERY WANT TO DELETE A COMMAND */
  }
  _sweepCooldowns (): void {
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
  createIPC (): void {
    this.ipc.register('reloadCommands', () => {
      for (const path in require.cache) {
        if (path.includes('bot/commands')) {
          delete require.cache[path];
        }
      }
      this.loggers.log('Commands reloaded probably');

      this.cmds = [];
      this.loadCommands();
    });
    this.ipc.register('reloadMost', () => {
      for (const path in require.cache) {
        if (path.includes('utils') || path.includes('bot/commands') || path.includes('bot/commandTypes')  || path.includes('bot/events')) {
          delete require.cache[path];
        }
      }
      this.cmds = [];
      this.loadCommands();
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
