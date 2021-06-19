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
    triggers: ["funichoose", "fchoose", "funchoose"],
    usage: "{command} {choice}",
    description: `2/3 - Use this command to choose the anime from ${constants_1.prefix}funiSearch. Response should be the ordinal or number corresponding to the choices.`,
    slashCmd: true,
    slashOpts: {
        name: "funichoose",
        description: "Use this command to choose an anime from the search results.",
        options: [
            {
                type: 4,
                name: "selection",
                description: "List a number from the choices you received.",
                required: true
            }
        ]
    },
    cooldown: 5 * 1000
}, ({ Bobb, message, args, addCD }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if ((_a = !args) !== null && _a !== void 0 ? _a : !(args.length))
        return `pick something to choose 🙄`;
    let person = Bobb.client.funiCache[message.author.id];
    if (!person)
        return `Please start by choosing an anime with the command \`${constants_1.prefix}funiSearch <term(s)>\``;
    let choice = person.choose(args[0]);
    if (choice.success === false)
        return `Error: ${choice.error}`;
    addCD();
    person = Bobb.client.funiCache[message.author.id];
    let emb = new discord_js_1.default.MessageEmbed()
        .setTitle(person.choiceTitle)
        .setDescription(`Success! The title ID is ${choice.res}`)
        .addField(`Final step command: ${constants_1.prefix}funiGetEp 2`, "This would fetch the 2nd episode of the anime.")
        .setFooter("Make sure the selected anime episode of the season is correct!")
        .setTimestamp()
        .setColor(Math.floor(Math.random() * 0xffffff));
    const Ret = new Bobb.Return("message");
    Ret.setEmbeds([emb]);
    return Ret;
}), ({ Bobb, interaction, addCD, argslash }) => __awaiter(void 0, void 0, void 0, function* () {
    let person = Bobb.client.funiCache[interaction.user.id];
    if (!person)
        return `Please start by choosing an anime with the command \`/funiSearch <term(s)>\``;
    let choice = person.choose(argslash.get("selection").value);
    if (choice.success === false)
        return `Error: ${choice.error}`;
    else {
        addCD();
        person = Bobb.client.funiCache[interaction.user.id];
        let emb = new discord_js_1.default.MessageEmbed()
            .setTitle(person.choiceTitle)
            .setDescription(`Success! The title ID is ${choice.res}`)
            .addField(`Final step command: /funiGetEp 2`, "This would fetch the 2nd episode of the anime.")
            .setFooter("Make sure the selected anime episode of the season is correct!")
            .setTimestamp()
            .setColor(Math.floor(Math.random() * 0xffffff));
        const Ret = new Bobb.Return("interaction");
        Ret.setEmbeds([emb]);
        return Ret;
    }
}));
//# sourceMappingURL=funiChoose.js.map