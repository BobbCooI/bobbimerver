"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gifs = exports.arrows = exports.PREMATURE_REQUIREMENTS = exports.SWEARWORDS = exports.AUTORESPONSE_MATRIX = exports.prefix = void 0;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.prefix = "c!";
exports.AUTORESPONSE_MATRIX = {
    dad: {
        regex: /^(im|i['’]m|i am)\s+(.+)/i,
        parse: (match) => `Hi ${match[2]}, I'm dad`
    },
    sec: {
        regex: /^(one sec$|one second|sec$)/i,
        parse: () => sleep(1000).then(() => "It's been one second")
    },
    ree: {
        regex: /^(ree)/i,
        parse: (match) => `R${"E".repeat(match.input.split(/ +g/)[0].length)}`
    },
    nou: {
        regex: /^(no (?=u{1,}$))/i,
        parse: () => "no u"
    }
};
exports.SWEARWORDS = [
    "fuck",
    "penis",
    "cunt",
    "faggot",
    "wank",
    "nigger",
    "nigga",
    "slut",
    "bastard",
    "bitch",
    "asshole",
    "dick",
    "blowjob",
    "cock",
    "pussy",
    "retard",
    "ligma",
    "sugondese",
    "sugandese",
    "fricc",
    "hecc",
    "sugma",
    "updog",
    "bofa",
    "fugma",
    "snifma",
    "bepis",
    "da wae",
    "despacito"
];
exports.PREMATURE_REQUIREMENTS = [
    "im",
    "i'm",
    "i am",
    "no u",
    "sec",
    "one sec",
    "ree"
].concat(exports.SWEARWORDS);
exports.arrows = new Map([
    ['⬅️', '%E2%AC%85%EF%B8%8F%20'],
    ['➡️', '%E2%9E%A1%EF%B8%8F%20'],
    ['⏩', '%E2%8F%A9'],
    ['⏪', '%E2%8F%AA']
]);
exports.gifs = {
    "nsfw": "https://i.imgur.com/oe4iK5i.gif",
    "externalEmojis": "https://i.imgur.com/JR5iwfy.gif",
    "attachFiles": "https://i.imgur.com/71C8BZY.gif",
    "embedLinks": "https://i.imgur.com/NVFcl9b.gif",
    "manageMessages": "https://i.imgur.com/DLEby8x.gif",
    "addReactions": "https://i.imgur.com/wuwSSwE.gif",
    "voiceConnect": "https://i.imgur.com/BJIwSaj.gif",
    "voiceSpeak": "https://i.imgur.com/wiNvMfs.gif",
    "voiceUseVAD": "https://i.imgur.com/ZEddIyP.gif",
    "readMessages": "https://i.imgur.com/lbBdKFT.gif",
    "sendMessages": "https://i.imgur.com/WawAYW4.gif",
    "readMessageHistory": "https://i.imgur.com/oG5a09j.gif"
};
//# sourceMappingURL=constants.js.map