"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const parseGoLink = (url) => {
    if (!(url === null || url === void 0 ? void 0 : url[0]))
        return null;
    let lin = url[0];
    return lin.includes("streaming")
        ? lin.replace(/&/g, "&amp;")
        : null;
};
const got_1 = __importDefault(require("got"));
const cheerio = __importStar(require("cheerio"));
const utils = __importStar(require("../utils"));
function gogoScrap(gogoLink) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const goDef = /https?:\/\/gogo-play\.net/gm;
        const goStream = /\/\/streamani\.net\/streaming\.php\?([a-zA-Z-\/0-9_=;+%&])+/gm;
        const streamServer = /\/\/streamani\.net\/loadserver\.php\?([a-zA-Z-\/0-9_=;+%&])+/g;
        const sourceReg = /(sources:\s?\[)({.*}),?]/gm;
        if (!goDef.exec(gogoLink))
            throw "Invalid Link";
        const firstHTML = (yield got_1.default(gogoLink)).body;
        let toApi = parseGoLink(goStream.exec(firstHTML));
        if (toApi === null)
            throw "Could not get source. Check the link to see if it is correct.";
        toApi = `https:${toApi}`;
        const nextHTML = (yield got_1.default(toApi)).body;
        const toServer = `https:${(_a = streamServer.exec(nextHTML)) === null || _a === void 0 ? void 0 : _a[0]}`;
        console.log(toServer);
        if (toServer === null)
            throw "Could not get stream link";
        const serverHTML = (yield got_1.default(toServer)).body;
        let $server = cheerio.load(serverHTML);
        const textNode = $server(".videocontent > script").text();
        if (textNode) {
            var scriptText = textNode
                .replace(/'/g, '"')
                .replace(/file:/g, '"file":')
                .replace(/label:/g, '"label":');
            var sourceEx = sourceReg.exec(scriptText);
            let link = sourceEx === null || sourceEx === void 0 ? void 0 : sourceEx[2];
            if (!link)
                throw "Could not get stream.";
            link = JSON.parse(link);
            return { success: true, link: utils.encode64(link.file) };
        }
        else
            throw "Could not get source.";
    });
}
exports.default = gogoScrap;
;
//# sourceMappingURL=gogo.js.map