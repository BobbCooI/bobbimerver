"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extClient = void 0;
const messageCollector_1 = __importDefault(require("./handlers/messageCollector"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const discord_js_1 = __importDefault(require("discord.js"));
const Person_1 = __importDefault(require("../db/models/Person"));
const Guild_1 = __importDefault(require("../db/models/Guild"));
const botDB_1 = __importDefault(require("../utils/botDB"));
const Stats_1 = __importDefault(require("../db/models/Stats"));
const config_json_1 = __importDefault(require("../config.json"));
const package_json_1 = __importDefault(require("../../package.json"));
const vrv_1 = __importDefault(require("../utils/scrapers/vrv"));
const funiClass_1 = __importDefault(require("../utils/scrapers/funiClass"));
const logger_1 = __importDefault(require("../utils/logger"));
const botMisc_1 = __importDefault(require("../utils/botMisc"));
const utils = __importStar(require("../utils/utils"));
const constants = __importStar(require("../utils/constants"));
const bot_1 = require("../types/bot");
const IPC_1 = __importDefault(require("../IPC"));
class extClient extends discord_js_1.default.Client {
    constructor(opts) {
        super(opts);
        this.crCache = {};
        this.vrvCache = {};
        this.funiCache = {};
        this.prefix = opts.prefix;
    }
}
exports.extClient = extClient;
class Bobb {
    constructor(client) {
        this.client = client;
        this.ipc = new IPC_1.default;
        this.cmds = [];
        this.slashCmds = [];
        this.mongo = {
            Person: Person_1.default,
            Guild: Guild_1.default
        };
        this.db = botDB_1.default(this);
        this.botStats = Stats_1.default;
        this.config = config_json_1.default;
        this.VRV = new vrv_1.default(this, { lang: "enUS", debug: true, premium: true });
        this.Funi = funiClass_1.default;
        this.loggers = logger_1.default(this);
        this.misc = botMisc_1.default(this);
        this.utils = utils;
        this.constants = constants;
        this.cooldowns = new Map();
        this.Return = bot_1.Return;
    }
    deploy() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Deploying...");
            this.messageCollector = new messageCollector_1.default(this.client);
            this.client.on("ready", this.ready.bind(this));
            const listeners = (yield Promise.resolve().then(() => __importStar(require(path_1.default.join(__dirname, "events"))))).default;
            for (const listener of listeners) {
                this.client.on(listener, require(path_1.default.join(__dirname, "events", listener)).handle.bind(this));
            }
        });
    }
    ready() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadCommands();
            const { client } = this;
            this.loggers.logReady(`Ready: ${process.memoryUsage().rss / 1024 / 1024}MB`);
            yield client.user.setActivity(`typescript 😍`, { type: "WATCHING" });
            this.mentionRX = /<@!*747231069002006609>/g;
            this.cmds.forEach(cmd => {
                console.log(cmd.category);
            });
            yield this.VRV.init();
            let auth = yield this.VRV.auth();
            if (!auth.success)
                throw `Oh no! Trouble vrv auth ${auth.error}`;
            console.log("Ready for action ❣️");
        });
    }
    loadCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            const categories = fs_1.default.readdirSync(path_1.default.join(__dirname, "commands"));
            yield this.utils.asyncForEach(categories, (categoryPath) => __awaiter(this, void 0, void 0, function* () {
                let category = (yield Promise.resolve().then(() => __importStar(require(path_1.default.join(__dirname, "commands", categoryPath))))).default;
                category.commands = yield Promise.all(category.commands.map((command) => __awaiter(this, void 0, void 0, function* () {
                    let elCmd = yield command;
                    return elCmd.default;
                }))).catch((e) => console.log(e));
                for (let command of category.commands) {
                    command.category = category.name;
                    command.description = category.description;
                    this.cmds.push(command);
                }
            }));
            yield this.loadInteractions();
        });
    }
    loadInteractions() {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedSlashCmds = this.cmds
                .filter((c) => { var _a; return c.props.slashCmd && ((_a = c.props.slashOpts) === null || _a === void 0 ? void 0 : _a.name); })
                .map((c) => {
                var _a;
                return ({
                    name: c.props.slashOpts.name.toLowerCase(),
                    description: c.props.slashOpts.description,
                    options: ((_a = c.props.slashOpts) === null || _a === void 0 ? void 0 : _a.options)
                        ? c.props.slashOpts.options
                        : []
                });
            });
            let e = yield this.client
                .application
                .commands
                .set(mappedSlashCmds);
            e.forEach(cmd => this.slashCmds.push(cmd.name));
            console.log(this.slashCmds);
        });
    }
    _sweepCooldowns() {
        for (const [key, value] of this.cooldowns) {
            let activeCooldowns = [];
            for (const cooldown of value.cooldowns) {
                if (cooldown[Object.keys(cooldown)[0]] > Date.now()) {
                    activeCooldowns.push(cooldown);
                }
            }
            if (!activeCooldowns[0]) {
                this.cooldowns.delete(key);
            }
            else if (activeCooldowns.length !== value.cooldowns.length) {
                this.cooldowns.set(key, {
                    cooldowns: activeCooldowns,
                    id: key
                });
            }
        }
    }
    createIPC() {
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
                if (path.includes('utils') || path.includes('bot/commands') || path.includes('bot/commandTypes') || path.includes('bot/events')) {
                    delete require.cache[path];
                }
            }
            this.cmds = [];
            this.loadCommands();
            this.loggers.log('Most things reloaded probably');
        });
        this.ipc.register('reloadConfig', () => {
            for (const path in require.cache) {
                if (path.includes('config')) {
                    delete require.cache[path];
                }
            }
            this.loggers.log('Config reloaded probably');
        });
    }
    get package() {
        return package_json_1.default;
    }
}
exports.default = Bobb;
//# sourceMappingURL=botClass.js.map