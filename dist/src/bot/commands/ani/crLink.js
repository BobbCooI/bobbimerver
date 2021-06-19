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
exports.default = new GenericCommand_1.default({
    triggers: ["crlink", "clink", "crunchylink", "crl"],
    usage: "{command} {link}",
    description: "Input an episode link from crunchyroll and you'll get back the video link.",
    slashCmd: true,
    slashOpts: {
        name: "crlink",
        description: "Input an episode link from crunchyroll.",
        options: [
            {
                type: 3,
                name: "link",
                description: "Crunchyroll link",
                required: true
            }
        ]
    },
    cooldown: 5 * 1000
}, ({ Bobb, message, addCD, args }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if ((_a = !args) !== null && _a !== void 0 ? _a : !(args.length))
        return `pick something to choose 🙄`;
    let st = Date.now();
    addCD();
    let person = Bobb.client.crCache[message.author.id];
    if (!person) {
        person = Bobb.client.crCache[message.author.id] = new Bobb.Crunchy(message.author.id, Bobb);
        yield person.login();
    }
    let epFromUrl = yield person.getEpByUrl(args[0], message);
    if (epFromUrl.success === false)
        return `Error! ${epFromUrl.error}`;
    else {
        person = Bobb.client.crCache[message.author.id];
        let emb = new discord_js_1.default.MessageEmbed()
            .setColor(Math.floor(Math.random() * 0xffffff))
            .setTitle(`${epFromUrl.res.aniTitle} | ${epFromUrl.res.epTitle}`)
            .setDescription(`Episode Number: ${epFromUrl.res.epNum}`)
            .addField(`HLS Stream: `, epFromUrl.res.hlsStream, true)
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        yield epFromUrl.message.edit(`Finished! Time taken: ${Bobb.misc.timeMili(Date.now() - st)}`);
        const Ret = new Bobb.Return("message");
        Ret.setEmbeds([emb]);
        return Ret;
    }
}), ({ Bobb, interaction, addCD, argslash }) => __awaiter(void 0, void 0, void 0, function* () {
    addCD();
    let st = Date.now();
    let person = Bobb.client.crCache[interaction.user.id];
    if (!person) {
        person = Bobb.client.crCache[interaction.user.id] = new Bobb.Crunchy(interaction.user.id, Bobb);
        yield person.login();
    }
    let epFromUrl = yield person.getEpByUrl(argslash.get("link").value, interaction);
    if (epFromUrl.success === false)
        return `Error! ${epFromUrl.error}`;
    else {
        person = Bobb.client.crCache[interaction.user.id];
        let emb = new discord_js_1.default.MessageEmbed()
            .setColor(Math.floor(Math.random() * 0xffffff))
            .setTitle(`${epFromUrl.res.aniTitle} | ${epFromUrl.res.epTitle}`)
            .setDescription(`Episode Number: ${epFromUrl.res.epNum}`)
            .addField(`HLS Stream: `, epFromUrl.res.hlsStream, true)
            .setTimestamp()
            .setFooter(`Requested by ${interaction.user.username}#${interaction.user.discriminator} | Time taken: ${Bobb.misc.timeMili(Date.now() - st)}`);
        person.latest = emb;
        const Ret = new Bobb.Return("interaction");
        Ret.setEmbeds([emb]);
        return Ret;
    }
}));
//# sourceMappingURL=crLink.js.map