function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export const AUTORESPONSE_MATRIX: {[index: string]: any} = {
  dad: {
    regex: /^(im|i['’]m|i am)\s+(.+)/i,
    parse: (match: any) => `Hi ${match[2]}, I'm dad`
  },
  sec: {
    regex: /^(one sec$|one second|sec$)/i,
    parse: () => sleep(1000).then(() => "It's been one second")
  },
  ree: {
    regex: /^(ree)/i,
    parse: (match: any) => `R${"E".repeat(match.input.split(/ +g/)[0].length)}`
  },
  nou: {
    regex: /^(no (?=u{1,}$))/i,
    parse: () => "no u"
  }
};
export const SWEARWORDS = [
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
export const PREMATURE_REQUIREMENTS = [
  "im",
  "i'm",
  "i am",
  "no u",
  "sec",
  "one sec",
  "ree"
].concat(SWEARWORDS);
export const arrows=new Map([
	['⬅️', '%E2%AC%85%EF%B8%8F%20'],
	['➡️', '%E2%9E%A1%EF%B8%8F%20'],
	['⏩', '%E2%8F%A9'],
	['⏪', '%E2%8F%AA']
]);

export const gifs: {[index: string]: string} = {
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
}