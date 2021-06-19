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
    triggers: ["crsearch", "csearch", "crunchysearch"],
    usage: "{command} {searchTerm}",
    description: "1/3 - Use this command to search for an anime of your choice with Crunchyroll.",
    slashCmd: true,
    slashOpts: {
        name: "crsearch",
        description: "Use this command to search. Then use crChoose to choose.",
        options: [
            {
                name: "search_query",
                description: "Search for an anime with Crunchyroll.",
                type: 3,
                required: true
            }
        ]
    },
    cooldown: 8 * 1000
}, ({ Bobb, message, addCD, args }) => __awaiter(void 0, void 0, void 0, function* () {
    addCD();
    if (Bobb.client.crCache[message.author.id])
        delete Bobb.client.crCache[message.author.id];
    let startTime = new Date().getTime();
    let base = (Bobb.client.crCache[message.author.id] = new Bobb.Crunchy(message.author.id, Bobb));
    yield base.login();
    let search = yield base.search(args);
    let en = Date.now();
    if (search.success === false)
        return search.error;
    else
        return new Bobb.Return("message").setEmbeds([new discord_js_1.default.MessageEmbed()
                .setTitle("Choices")
                .setDescription(search.join("\n"))
                .setFooter(`Time taken: ${Bobb.misc.timeMili(en - startTime)} - You can choose like this: ${constants_1.prefix}crChoose 1st`)
        ]);
}), ({ Bobb, interaction, argslash, addCD }) => __awaiter(void 0, void 0, void 0, function* () {
    addCD();
    if (Bobb.client.crCache[interaction.user.id])
        delete Bobb.client.crCache[interaction.user.id];
    let startTime = Date.now();
    let base = (Bobb.client.crCache[interaction.user.id] = new Bobb.Crunchy(interaction.user.id, Bobb));
    yield base.login();
    let search = yield base.search(argslash.get("search_query").value);
    let en = new Date().getTime();
    if (search.success === false)
        return search.error;
    else {
        let Ret = new Bobb.Return("message");
        Ret.setEmbeds([new discord_js_1.default.MessageEmbed()
                .setTitle("Choices")
                .setDescription(search.join("\n"))
                .setFooter(`Time taken: ${Bobb.misc.timeMili(en - startTime)} - You can choose like this: ${constants_1.prefix}crChoose 1st`)]);
        return Ret;
    }
}));
//# sourceMappingURL=crSearch.js.map