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
const discord_js_1 = __importDefault(require("discord.js"));
const constants_1 = require("../../../utils/constants");
exports.default = new GenericCommand_1.default({
    triggers: ["funisearch", "fsearch", "funsearch"],
    usage: "{command} {searchTerm(s)}",
    description: "1/3 - Use this command to search for an anime of your choice with Funimation.",
    slashCmd: true,
    slashOpts: {
        name: "funisearch",
        description: "Use this command to search. Then use funiChoose to choose.",
        options: [
            {
                name: "search_query",
                description: "Search for an anime with Funimation.",
                type: 3,
                required: true
            }
        ]
    },
    cooldown: 8 * 1000
}, ({ Bobb, message, args, addCD }) => __awaiter(void 0, void 0, void 0, function* () {
    if (Bobb.client.funiCache[message.author.id])
        delete Bobb.client.funiCache[message.author.id];
    let startTime = new Date().getTime();
    let base = (Bobb.client.funiCache[message.author.id] = new Bobb.Funi(message.author.id, Bobb, { enSub: !(message.author.id == "707704956131475539" || message.author.id == "443145161057370122") }));
    let search = yield base.search(args);
    let en = new Date().getTime();
    if (search.success === false)
        return search.error;
    else {
        addCD();
        let Ret = new Bobb.Return("message");
        Ret.setEmbeds([new discord_js_1.default.MessageEmbed()
                .setTitle("Choices")
                .setDescription(search.res.join("\n"))
                .setFooter(`Time taken: ${Bobb.misc.timeMili(en - startTime)} - You can choose like this: ${constants_1.prefix}funiChoose 1st`)
        ]);
        return Ret;
    }
}), ({ Bobb, interaction, argslash, addCD }) => __awaiter(void 0, void 0, void 0, function* () {
    if (Bobb.client.funiCache[interaction.user.id])
        delete Bobb.client.funiCache[interaction.user.id];
    let startTime = new Date().getTime();
    let base = (Bobb.client.funiCache[interaction.user.id] = new Bobb.Funi(interaction.user.id, Bobb, { enSub: !(interaction.user.id == "707704956131475539" || interaction.user.id == "443145161057370122") }));
    yield base.login();
    let search = yield base.search(argslash.get("search_query").value);
    let en = new Date().getTime();
    if (search.success === false)
        return search.error;
    else {
        addCD();
        const Ret = new Bobb.Return("interaction");
        Ret.setEmbeds([
            new discord_js_1.default.MessageEmbed()
                .setTitle("Choices")
                .setDescription(search.res.join("\n"))
                .setFooter(`Time taken: ${Bobb.misc.timeMili(en - startTime)} - You can choose like this: /funiChoose 1st`)
        ]);
        return Ret;
    }
}));
//# sourceMappingURL=funiSearch.js.map