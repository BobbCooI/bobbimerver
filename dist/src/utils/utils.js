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
exports.parseTime = exports.slugify = exports.makeID = exports.randomNumber = exports.cmdReq = exports.generateUUID = exports.decode64 = exports.encode64 = exports.randomNonce = exports.percentEncode = exports.asyncForEach = exports.verify = exports.createWebhook = exports.ordinate = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const discord_js_1 = __importDefault(require("discord.js"));
function ordinate(i) {
    var j = i % 10, k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}
exports.ordinate = ordinate;
;
function createWebhook(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!opts.embedContent)
            return;
        let webhookClient = new discord_js_1.default.WebhookClient(process.env.webhookURL, process.env.webhookToken);
        let date = Date()
            .toString()
            .split(" ")
            .slice(1, 5)
            .join(" ");
        const embed = new discord_js_1.default.MessageEmbed()
            .setTitle(`[${opts.type}] | Date: ${date}`)
            .setDescription(opts.embedContent)
            .setColor("#0099ff");
        let toSend = {
            username: opts.user,
            avatarURL: "https://cdn.discordapp.com/avatars/800952633241501696/c6eb8c12d3623a6ca5575fdbb81892db.png",
            embeds: [embed],
            content: opts.content || ""
        };
        yield webhookClient.send(toSend);
    });
}
exports.createWebhook = createWebhook;
function verify(token) {
    return new Promise(function (resolve, reject) {
        jsonwebtoken_1.default.verify(token, process.env.jwtAccessSecret, function (err, decode) {
            if (err) {
                reject(err);
                return;
            }
            resolve(!!decode);
        });
    });
}
exports.verify = verify;
function asyncForEach(array, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let index = 0; index < array.length; index++) {
            yield callback(array[index], index, array);
        }
    });
}
exports.asyncForEach = asyncForEach;
function percentEncode(e) {
    return encodeURIComponent(e)
        .replace(/\!/g, "%21")
        .replace(/\*/g, "%2A")
        .replace(/\'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29");
}
exports.percentEncode = percentEncode;
function randomNonce(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
exports.randomNonce = randomNonce;
function encode64(str) {
    const a = crypto_js_1.default.enc.Utf8.parse(str);
    const encoded = crypto_js_1.default.enc.Base64.stringify(a);
    return encoded;
}
exports.encode64 = encode64;
function decode64(str) {
    const encodedWord = crypto_js_1.default.enc.Base64.parse(str);
    const decoded = crypto_js_1.default.enc.Utf8.stringify(encodedWord);
    return decoded;
}
exports.decode64 = decode64;
function generateUUID() {
    var d = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
}
exports.generateUUID = generateUUID;
exports.cmdReq = axios_1.default.create({
    baseURL: `https://discord.com/api/v8/applications/${process.env.appID}/guilds/${process.env.guildID}/commands`,
    responseType: "json",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${process.env.botToken}`
    }
});
function randomNumber(min, max) {
    if (!min || !max) {
        min = 0;
        max = 100;
    }
    return Math.floor(Math.random() * (max - min + 1) + min);
}
exports.randomNumber = randomNumber;
function makeID(length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.makeID = makeID;
function slugify(str) {
    const a = "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
    const b = "aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------";
    const p = new RegExp(a.split("").join("|"), "g");
    return str
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(p, c => b.charAt(a.indexOf(c)))
        .replace(/&/g, "-and-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "");
}
exports.slugify = slugify;
function parseTime(s) {
    function pad(n, z) {
        z = z || 2;
        return ("00" + n).slice(-z);
    }
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
    return `${pad(hrs)} Hours : ${pad(mins)} Minutes : ${pad(secs)}.${pad(ms, 3)} Seconds`;
}
exports.parseTime = parseTime;
//# sourceMappingURL=utils.js.map