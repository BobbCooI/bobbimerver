"use strict";
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
const GenericCommand_1 = __importDefault(require("../../commandTypes/GenericCommand"));
const discord_js_1 = require("discord.js");
exports.default = new GenericCommand_1.default({
    triggers: ["ping", "pong"],
    usage: "{command}",
    description: "Check my ping..",
    bypass: true,
    slashCmd: true,
    slashOpts: {
        name: "ping",
        description: "Check my ping.."
    }
}, ({ Bobb, message }) => __awaiter(void 0, void 0, void 0, function* () {
    const ret = new Bobb.Return("message");
    ret
        .setContent(`🏓 Pong! ${Date.now() - message.createdTimestamp}ms`)
        .setComponents([
        new discord_js_1.MessageButton({ type: 2,
            label: "lol",
            style: "PRIMARY",
            customID: "lolbut"
        })
    ]);
    return ret;
}), ({ Bobb, interaction }) => __awaiter(void 0, void 0, void 0, function* () {
    const ret = new Bobb.Return("interaction");
    ret.setContent(`🏓 Slash Command Pong! ${Date.now() -
        interaction.createdTimestamp}ms`);
    return ret;
}));
//# sourceMappingURL=ping.js.map