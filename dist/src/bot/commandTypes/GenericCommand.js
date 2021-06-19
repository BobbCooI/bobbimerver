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
const SlashCommand_1 = __importDefault(require("./SlashCommand"));
class GenericCommand {
    constructor(attr, fn, fnSlash) {
        this.attr = attr;
        this.fn = fn;
        if (this.fnSlash || (this.props.slashCmd || this.props.slashOpts))
            this.fnSlash = new SlashCommand_1.default(this.props, fnSlash);
    }
    run({ Bobb, message, args, addCD }) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.fn({ Bobb, message, args, addCD });
        });
    }
    get props() {
        return Object.assign({
            usage: "{command}",
            cooldown: 2000,
            donorCD: 500,
            isNSFW: false,
            ownerOnly: false,
            dmOnly: false,
            bypass: false,
            slashCmd: false,
            cooldownMessage: "chill ur beans for "
        }, this.attr, { perms: ["SEND_MESSAGES"].concat(this.attr.perms || []) });
    }
}
exports.default = GenericCommand;
//# sourceMappingURL=GenericCommand.js.map