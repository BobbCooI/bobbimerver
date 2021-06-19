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
const GenericCommand_js_1 = __importDefault(require("../../commandTypes/GenericCommand.js"));
exports.default = new GenericCommand_js_1.default({
    triggers: ["verify"],
    minArgs: 1,
    usage: "{command} [UUID]",
    missingArgs: "Missing the UUID.",
    "description": "Verify your discord using the UUID on your website account.",
    dmOnly: true,
    cooldown: 4500
}, ({ Bobb, message, args, addCD }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!args || !args.length || args.length === 0)
        return `give me your UUID from your profile on <website soon>!`;
    addCD();
    let pos = yield Bobb.mongo.Person.findOne({ UUID: args[0] });
    let upd = {
        discID: message.author.id,
        discTag: message.author.tag,
        verified: true
    };
    if (pos) {
        if (pos.discTag)
            return `You have already linked your Discord account.`;
        yield Bobb.db.updateMember({ UUID: args[0] }, upd);
        return `Verification successful. Thank you for linking!`;
    }
    else {
        return `Verification unsuccessful. Please find your UUID by going to the Website > Account > Discord`;
    }
}));
//# sourceMappingURL=verify.js.map