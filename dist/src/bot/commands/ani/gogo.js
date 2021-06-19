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
const gogo_1 = __importDefault(require("../../../utils/scrapers/gogo"));
exports.default = new GenericCommand_1.default({
    triggers: ["gogo"],
    usage: "{command} {link}",
    description: "fetches gogo stream using a given url. (`https://gogo-play.net`)",
    slashCmd: true,
    slashOpts: {
        name: "gogo",
        description: "fetches gogo stream using a given url. (`https://gogo-play.net`)",
        options: [
            {
                name: "link",
                description: "gogo link (`https://gogo-play.net`)",
                type: 3,
                required: true
            }
        ]
    },
    cooldown: 8 * 1000
}, ({ Bobb, args, addCD }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let mainURL = yield gogo_1.default((args === null || args === void 0 ? void 0 : args[0]) || '');
        if (mainURL) {
            addCD();
            return Bobb.utils.decode64(mainURL.link);
        }
        else
            throw 'unknown error 😮‍💨';
    }
    catch (e) {
        return e || 'there was an error fetching with that link..';
    }
}), ({ Bobb, argslash, addCD }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let mainURL = yield gogo_1.default(argslash.get('link').value);
        if (mainURL) {
            addCD();
            return Bobb.utils.decode64(mainURL.link);
        }
        else
            throw 'unknown error 😮‍💨';
    }
    catch (e) {
        return e || 'there was an error fetching with that link..';
    }
}));
//# sourceMappingURL=gogo.js.map