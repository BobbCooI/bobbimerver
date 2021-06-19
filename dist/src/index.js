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
const express_1 = __importDefault(require("express"));
const app = express_1.default();
const mongoose_1 = __importDefault(require("./db/mongoose"));
const botClass_1 = __importStar(require("./bot/botClass"));
const discord_js_1 = require("discord.js");
const constants_1 = require("./utils/constants");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const Stats_1 = __importDefault(require("./db/models/Stats"));
const api_1 = __importDefault(require("./api"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
function mainLaunch() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connector();
        const client = new botClass_1.extClient({
            intents: [
                discord_js_1.Intents.FLAGS.GUILDS,
                discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
                discord_js_1.Intents.FLAGS.GUILD_BANS,
                discord_js_1.Intents.FLAGS.GUILD_EMOJIS,
                discord_js_1.Intents.FLAGS.GUILD_INTEGRATIONS,
                discord_js_1.Intents.FLAGS.GUILD_WEBHOOKS,
                discord_js_1.Intents.FLAGS.GUILD_INVITES,
                discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES,
                discord_js_1.Intents.FLAGS.GUILD_PRESENCES,
                discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
                discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                discord_js_1.Intents.FLAGS.GUILD_MESSAGE_TYPING,
                discord_js_1.Intents.FLAGS.DIRECT_MESSAGES,
                discord_js_1.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                discord_js_1.Intents.FLAGS.DIRECT_MESSAGE_TYPING
            ],
            prefix: constants_1.prefix
        });
        client.login(process.env.botToken);
        const Asuna = new botClass_1.default(client);
        yield Asuna.deploy();
        app.set("trust proxy", 1);
        app.use(morgan_1.default(":method | :url | :status :response-time ms | Content length - :res[content-length] | ip - :remote-addr | header - :req[header]"));
        app.use(helmet_1.default());
        app.use(cookie_parser_1.default());
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true }));
        app.use((_req, _res, next) => {
            next();
        }, cors_1.default({ maxAge: 84600 }));
        app.use("/api", api_1.default);
        app.use("/", (_req, _res, next) => __awaiter(this, void 0, void 0, function* () {
            Stats_1.default.updateOne({ _id: "60070be0f12d9e041931de68" }, { $inc: { webRequests: 1 } });
            next();
        }));
        let port = 3000;
        app.listen(port, () => {
            console.log("❇️ Express server is running on port", port);
        });
        app.get("/", (_req, res) => {
            res.send("Hello World!");
        });
    });
}
exports.default = mainLaunch;
mainLaunch();
//# sourceMappingURL=index.js.map