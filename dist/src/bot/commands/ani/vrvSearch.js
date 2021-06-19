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
    triggers: ["vrvsearch", "vsearch"],
    usage: "{command} {searchTerm}",
    description: "1/3 - Use this command to search for an anime of your choice with VRV.",
    slashCmd: true,
    slashOpts: {
        name: "vrvsearch",
        description: "Use this command to search. Then use vrvChoose to choose.",
        options: [
            {
                name: "search_query",
                description: "Search for an anime with VRV.",
                type: 3,
                required: true
            }
        ]
    },
    cooldown: 8 * 1000
}, ({ Bobb, message, addCD, args }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!args.length)
        return `atleast give me something to search up 🙄`;
    addCD();
    let startTime = Date.now();
    Bobb.VRV.initPerson(message.author.id);
    let search = yield Bobb.VRV.search(args.join(" "), message.author.id);
    let end = Date.now();
    if (search.success === false)
        return search.error;
    const Ret = new Bobb.Return("message");
    Ret.setEmbeds([
        new discord_js_1.default.MessageEmbed()
            .setTitle("Choices")
            .setDescription(search.res.join("\n"))
            .setFooter(`Time taken: ${Bobb.misc.timeMili(end - startTime)} - You can choose like this: ${constants_1.prefix}vrvChoose 1st`)
    ]);
    return Ret;
}), ({ Bobb, interaction, argslash, addCD }) => __awaiter(void 0, void 0, void 0, function* () {
    addCD();
    let startTime = Date.now();
    Bobb.VRV.initPerson(interaction.user.id);
    let search = yield Bobb.VRV.search(argslash.get("search_query").value, interaction.user.id);
    let end = Date.now();
    if (search.success === false)
        return search.error;
    const Ret = new Bobb.Return("interaction");
    Ret.setEmbeds([
        new discord_js_1.default.MessageEmbed()
            .setTitle("Choices")
            .setDescription(search.res.join("\n"))
            .setFooter(`Time taken: ${Bobb.misc.timeMili(end - startTime)} - You can choose like this: /vrvChoose 1`)
    ]);
    return Ret;
}));
//# sourceMappingURL=vrvSearch.js.map