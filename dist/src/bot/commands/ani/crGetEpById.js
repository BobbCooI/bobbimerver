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
    triggers: ["crgetep", "cgetep", "crunchygetep"],
    usage: "{command} {1-3 or 1,2,3 or latest}",
    description: `3/3 - Use this command to get the episodes of your choice from ${constants_1.prefix}crChoose. Usage can be 1, 1,2, 1-2, or 'latest'`,
    slashCmd: true,
    slashOpts: {
        name: "crgetep",
        description: "Get episode from chosen anime.",
        options: [
            {
                type: 3,
                name: "episodes",
                description: "Usage: 1-2 | 1,2 | latest",
                required: true
            }
        ],
    },
    cooldown: 10 * 1000
}, ({ Bobb, message, args, addCD }) => __awaiter(void 0, void 0, void 0, function* () {
    const st = Date.now();
    let person = Bobb.client.crCache[message.author.id];
    if (!person)
        return `Please start by choosing an anime with the command \`${constants_1.prefix}crSearch <term(s)>\``;
    addCD();
    let epFromId = yield person.getShowById(person.choiceId, args.join("").toString(), message);
    let streambeds = [];
    if (epFromId.res.success === false)
        return `${epFromId.res.errors}`;
    else {
        for (let ep in epFromId.res.epMedia) {
            let emb = new discord_js_1.default.MessageEmbed()
                .setColor(Math.floor(Math.random() * 0xffffff))
                .setTitle(`${person.choiceTitle} | ${epFromId.res.epMedia[ep].epTitle}`)
                .setDescription(`Episode Number: ${ep}`)
                .addField(`Stream URL: `, epFromId.res.epMedia[ep].hlsStream.url, true)
                .addField(`Expires in: `, Bobb.utils.parseTime(new Date(epFromId.res.epMedia[ep].hlsStream.expires).getTime() -
                Date.now()), true)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.tag} | Time taken: ${Bobb.misc.timeMili(epFromId.res.epMedia[ep].tTime)}`);
            person.latest = emb;
            streambeds.push(emb);
        }
    }
    yield epFromId.message.edit(`Finished! Time taken: ${Bobb.misc.timeMili(Date.now() - st)}`);
    const Ret = new Bobb.Return("message", { Paginate: true });
    Ret
        .setEmbeds(streambeds)
        .Paginator(message, "Streams");
    return Ret;
}), ({ Bobb, interaction, argslash, addCD }) => __awaiter(void 0, void 0, void 0, function* () {
    addCD();
    let st = Date.now();
    let person = Bobb.client.crCache[interaction.user.id];
    if (!person)
        return `Please start by choosing an anime with the command \`/crSearch <term(s)>\``;
    let epFromId = yield person.getShowById(person.choiceID, argslash.get("episodes").value);
    if (epFromId.success === false)
        return `${epFromId.res.errors ? epFromId.res.errors : epFromId.res.error}`;
    else {
        let embeds = [];
        Object.keys(epFromId.res.epMedia).forEach((ep) => {
            let emb = new discord_js_1.default.MessageEmbed()
                .setColor(Math.floor(Math.random() * 0xffffff))
                .setTitle(`${person.choiceTitle} | ${epFromId.res.epMedia[ep].epTitle}`)
                .setDescription(`Episode Number: ${ep}`)
                .addField(`HLS Stream: `, epFromId.res.epMedia[ep].hlsStream.url, true)
                .addField(`Expires in: `, Bobb.utils.parseTime(new Date(epFromId.res.epMedia[ep].hlsStream.expires).getTime() -
                Date.now()), true)
                .setTimestamp()
                .setFooter(`Requested by ${interaction.user.username}#${interaction.user.discriminator} | Time taken{ ${Bobb.misc.timeMili(epFromId.res.epMedia[ep].tTime)}`);
            embeds.push(emb);
        });
        person.latest = embeds[embeds.length - 1];
        const Ret = new Bobb.Return("interaction");
        Ret
            .setEmbeds(embeds)
            .setContent(`Done! Total time taken: ${Bobb.misc.timeMili(Date.now() - st)}`);
        return Ret;
    }
}));
//# sourceMappingURL=crGetEpById.js.map