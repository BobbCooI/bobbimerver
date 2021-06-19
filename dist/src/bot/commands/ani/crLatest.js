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
const constants_1 = require("../../../utils/constants");
exports.default = new GenericCommand_1.default({
    triggers: ["crlatest", "crlate", "crla"],
    usage: "{command}",
    description: "Use this command to get your latest episode fetch.",
    slashCmd: false,
    slashOpts: {
        name: "crLatest",
        description: "Get your latest episode fetch."
    },
    cooldown: 6.5 * 1000
}, ({ Bobb, message, addCD }) => __awaiter(void 0, void 0, void 0, function* () {
    addCD();
    let person = Bobb.client.crCache[message.author.id];
    if (!person)
        return `Please start by choosing an anime with the command \`${constants_1.prefix}crSearch <term(s)>\``;
    if (!person.latest) {
        return "at least fetch an episode first..";
    }
    const Ret = new Bobb.Return("message");
    Ret.setEmbeds([person.latest]);
    return Ret;
}), ({ Bobb, addCD, interaction }) => __awaiter(void 0, void 0, void 0, function* () {
    addCD();
    let person = Bobb.client.crCache[interaction.user.id];
    if (!person)
        return `Please start by choosing an anime with the command \`/crSearch <term(s)>\``;
    if (!person.latest) {
        return "at least fetch an episode first..";
    }
    const Ret = new Bobb.Return("interaction");
    Ret.setEmbeds([person.latest]);
    return Ret;
}));
//# sourceMappingURL=crLatest.js.map