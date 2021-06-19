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
    triggers: ["vrvchoose", "vchoose"],
    usage: "{command} {choice}",
    description: `2/3 - Use this command to choose the anime from ${constants_1.prefix}vrvSearch. Response should be corresponding to the choice number.`,
    slashCmd: true,
    slashOpts: {
        name: "vrvchoose",
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
}, ({ Bobb, message, addCD, args }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if ((_a = !args) !== null && _a !== void 0 ? _a : !(args.length))
        return `pick something to choose 🙄`;
    let person = Bobb.VRV.cache[message.author.id];
    if (!person)
        return `Please start by choosing an anime with the command \`${constants_1.prefix}vrvSearch <term(s)>\``;
    let choice = yield Bobb.VRV.choose(args[0], message.author.id);
    if (choice.success === false)
        return `Error: ${choice.error}`;
    addCD();
    let embeds = [];
    let start = 0;
    let end = 20;
    console.log(choice.res, typeof choice.res);
    for (let i = 0; i < Math.ceil(choice.res.length / 20); i++) {
        const emb = new discord_js_1.default.MessageEmbed()
            .setTitle(choice.title)
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(choice.res.slice(start, end).join('\n'))
            .setFooter(`Selection could be ${constants_1.prefix}vrvGetEp \`${choice.res[1].split(" ")[0]}\` or \`${choice.res[1]
            .split(" ")[0]
            .slice(0, -2)}\` to get the second episode.`)
            .setTimestamp()
            .setColor(Math.floor(Math.random() * 0xffffff));
        start += 20;
        end += 20;
        embeds.push(emb);
    }
    if (embeds.length === 1) {
        const Ret = new Bobb.Return("message");
        Ret.setEmbeds(embeds);
        return Ret;
    }
    const Ret = new Bobb.Return("message", { Paginate: true });
    Ret
        .setEmbeds(embeds)
        .Paginator(message, `Selection could be "${constants_1.prefix}vrvGetEp <${choice.res[1].split(" ")[0]} | ${choice.res[1]
        .split(" ")[0]
        .slice(0, -2)}> to get the second episode.`);
    return Ret;
}), ({ Bobb, interaction, argslash }) => __awaiter(void 0, void 0, void 0, function* () {
    let person = Bobb.VRV.cache[interaction.user.id];
    if (!person)
        return `Please start by choosing an anime with the command \`${constants_1.prefix}vrvSearch <term(s)>\``;
    let choice = yield Bobb.VRV.choose(argslash.get("selection").value, interaction.user.id);
    if (choice.success === false)
        return `Error: ${choice.error}`;
    let embeds = [];
    let start = 0;
    let end = 20;
    console.log(choice);
    for (let i = 0; i < Math.ceil(choice.res.length / 20); i++) {
        const emb = new discord_js_1.default.MessageEmbed()
            .setTitle(choice.title)
            .setAuthor(`${interaction.user.username}#${interaction.user.discriminator}`, `https:\/\/cdn.discordapp.com/avatar/${interaction.user.id}/${interaction.user.avatar}.png`)
            .setDescription(choice.res.slice(start, end).join('\n'))
            .setFooter(`Selection could be "${constants_1.prefix}vrvGetEp ${choice.res[1].split(" ")[0]}" or "${choice.res[1]
            .split(" ")[0]
            .slice(0, -2)}" to get the second episode.`)
            .setTimestamp()
            .setColor(Math.floor(Math.random() * 0xffffff));
        start += 20;
        end += 20;
        embeds.push(emb);
    }
    if (embeds.length === 1)
        return embeds[0];
    const Ret = new Bobb.Return("interaction");
    Ret.setEmbeds(embeds);
    return Ret;
}));
//# sourceMappingURL=vrvChoose.js.map