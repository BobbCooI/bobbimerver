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
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../../../utils/constants");
exports.default = new GenericCommand_1.default({
    triggers: ["vrvgetep", "vgetep"],
    usage: "{command} {1-3 or 1,2,3 or latest}",
    description: `3/3 - Use this command to get the episodes of your choice from ${constants_1.prefix}vrvChoose. Usage can be 1, 1,2, 1-2, or 'latest'`,
    slashCmd: false,
    slashOpts: {
        name: "vrvgetep",
        description: "Get episode from chosen anime.",
        options: [
            {
                type: 3,
                name: "episodes",
                description: "Usage: 1-2 | 1,2 | latest",
                required: true
            }
        ]
    },
    cooldown: 10 * 1000
}, ({ Bobb, message, addCD, args }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if ((_a = !args) !== null && _a !== void 0 ? _a : !args.length)
        return `give me an episode from them choices 🙄`;
    let st = Date.now();
    let person = Bobb.VRV.cache[message.author.id];
    if (!person)
        return `Please start by choosing an anime with the command \`${constants_1.prefix}vrvSearch <term(s)>\``;
    addCD();
    let initial = yield message.channel.send("Getting stream..");
    let epFromId = yield Bobb.VRV.getStream(args.join("").toString(), initial, message.author.id);
    if (epFromId.success === false)
        return `${epFromId.error}`;
    let mediaEmbeds = [];
    for (let ep in epFromId.epMedia) {
        const shortenedURL = (_b = (yield axios_1.default.get(`https:\/\/tinyurl.com/api-create.php?url=${epFromId.epMedia[ep].streamURL}`))) === null || _b === void 0 ? void 0 : _b.data;
        let emb = new discord_js_1.default.MessageEmbed()
            .setColor(Math.floor(Math.random() * 0xffffff))
            .setTitle(`${(_c = Bobb.VRV.cache[message.author.id]) === null || _c === void 0 ? void 0 : _c.choiceTitle} | ${epFromId.epMedia[ep].epTitle}`)
            .setDescription(`Episode Number: ${ep}`)
            .addField(`Stream URL: `, shortenedURL !== null && shortenedURL !== void 0 ? shortenedURL : epFromId.epMedia[ep].streamURL, true)
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag} | Time taken: ${Bobb.misc.timeMili(epFromId.epMedia[ep].timeTaken)}`);
        person.latest = emb;
        mediaEmbeds.push(emb);
    }
    epFromId.message
        ? yield epFromId.message.edit(`Finished! Total time taken: ${Bobb.misc.timeMili(Date.now() - st)}`)
        : yield initial.edit(`Finished! Total time taken: ${Bobb.misc.timeMili(Date.now() - st)}`);
    Bobb.VRV.setCacheEmbed(message.author.id, mediaEmbeds[0]);
    const Ret = new Bobb.Return("message", { Paginate: true });
    Ret.setEmbeds(mediaEmbeds).Paginator(message, "Streams");
    return Ret;
}));
//# sourceMappingURL=vrvGetEp.js.map