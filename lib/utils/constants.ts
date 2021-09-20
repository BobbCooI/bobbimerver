function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export const AUTORESPONSE_MATRIX: { [index: string]: any } = {
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

export let emojis = {
  // shoutout to blobhub for the ebic emotes, https://inv.wtf/blobhub
  success: "<:yes:534174796888408074>",
  error: "<:no:534174796938870792>",
  slashError: "<:error:837406115280060505>",
  warning: "<:maybe:534174796578160640>",
  statuspage: {
    operational: "<:operational:685538400639385649>",
    degraded_performance: "<:degraded_performance:685538400228343808>",
    partial_outage: "<:partial_outage:685538400555499675>",
    major_outage: "<:major_outage:685538400639385706>",
    under_maintenance: "<:maintenance:685538400337395743>",
  },
  badges: {
    DISCORD_EMPLOYEE: "<:DiscordStaff:844154550402809916>",
    PARTNERED_SERVER_OWNER: "<:partnericon:844154710637805580>",
    HYPESQUAD_EVENTS: "<:HypesquadEvents:698349980192079882>",
    BUGHUNTER_LEVEL_1: "<:BugHunter:844155858354962432>",
    BUGHUNTER_LEVEL_2: "<:GoldBugHunter:698350544103669771>",
    EARLY_SUPPORTER: "<:EarlySupporter:698350657073053726>",
    VERIFIED_BOT:
      "<:verifiedbot1:700325427998097449><:verifiedbot2:700325521665425429>",
    EARLY_VERIFIED_BOT_DEVELOPER: "<:VerifiedBotDev:720179031785340938>",
    DISCORD_CERTIFIED_MODERATOR: "<:CertifiedModerator:844189980305653790>",
    PARTNERED: "<:PartnerWithBanner:844154648680071189>",
    VERIFIED: "<:VerifiedWithBanner:751196492517081189>",
    OWNER: "<:ownercrown:831858918161776661>",
    FIRE_ADMIN: "<:FireVerified:671243744774848512>",
    FIRE_PREMIUM: "<:FirePremium:680519037704208466>",
  },
  channels: {
    text: "<:channeltext:794243232648921109>",
    voice: "<:channelvoice:794243248444407838>",
    stage: "<:channelstage:831890012366307379>",
    news: "<:channelannouncements:794243262822350919>",
  },
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
export const arrows = new Map([
  ['⬅️', '%E2%AC%85%EF%B8%8F%20'],
  ['➡️', '%E2%9E%A1%EF%B8%8F%20'],
  ['⏩', '%E2%8F%A9'],
  ['⏪', '%E2%8F%AA']
]);

export const gifs: { [index: string]: string } = {
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
const errors = {
  // Voice related errors
  Disconnected: `Discord fucked something up. 😠\n\nTo fix this, you have to got to server settings and change the voice region.\nIf it still doesn't work after that, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`vc1\`.`,

  "Voice connection timeout": `Discord fucked something up. 😠\n\nTo fix this, first try running \`pls stop\`.\nIf that doesn't work, you have to kick me and reinvite me back. I know, it is stupid. 🙄\nIf it still doesn't work after that, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`vc2\`.`,

  "Already encoding": `Something fucked up. 😠\n\nWe're pretty sure this error happens when you're running voice commands too quickly. So slow down 🙄\nIf it's still happening after a while, (<https://discord.gg/Wejhbd4>) and tell support it is error \`vc3\`.`,

  // Currency Errors
  new_val: `Oopsy doopsy, we made a fucky wucky! 😊\n\nThis shouldn't happen to you again, and we are working semi-hard on fixing it. \nIf it DOES happen again, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`econ1\`.`,

  // Image Errors
  "Invalid character in header content": `Well heck, I didn't like some character you used for this command! 😠\n\nIf you used any "not normal" characters for this command, remove those and try again. \nIf it is still happening, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`img1\`.`,

  "socket hang up": `Looks like we just restarted our image server\n\nOnce it is done rebooting, this command will work again. Give it just a few seconds!\nIf it is still happening after multiple minutes, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`img2\`.`,

  // Discord Errors
  "DiscordRESTError [50001]: Missing Access": `Hey! For some reason I don't have permission to run that command. 😠\n\nMake sure you have given me the correct channel perms to run this command. \nIf it is still happening after messing with permissions, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis1\`.`,

  "Request timed out (>15000ms) on POST": `aggggghhhhhhhh discord is having connection issues 😠\n\nAll we can do is wait until they're better. Sorryyyyyy.\nIf it is still happening after a few hours, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis2\`.`,

  "DiscordRESTError [50013]: Missing Permissions": `Hey! For some reason I don't have permission to run that command. 😠\n\nMake sure you have given me the correct channel perms to run this command. \nIf it is still happening after messing with permissions, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis3\`.`,

  "Must be 2000 or fewer in length": `You included too many characters in that.\n\nI am only able to send 2k characters in one message, so please try again with less characters.\nIf it is still happening, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis4\`.`,

  "DiscordHTTPError: 500 INTERNAL SERVER ERROR on POST": `aggggghhhhhhhh discord is having connection issues 😠\n\nAll we can do is wait until they're better. Sorryyyyyy.\nIf it is still happening after a few hours, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis5\`.`,

  // Known Errors
  "Cannot read property 'triggers' of undefined": `This command is currently under maintenance, sorry :(\n\nIt will work if you are spelling the command you are enabling/disabling correctly.\nIf it is still happening, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`bug1\`.`,

  "504 Gateway Timeout": `Look like the service we use for this command is giving us problems :(\n\nAll we can currently do is wait, sadly\nIf it is still happening after a few hours, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`bug2\`.`,

  // Bug Hunting errors
  "DiscordRESTError [10003]: Unknown Channel": `Something broke!\n\nI am currently not sure why this bug is happening, but if you report this bug in the support server, you will get paid for it in meme coins.\nJoin (<https://discord.gg/Wejhbd4>) and tell support it is error \`hunt1\`.`
};


export function errorMessages(e: string) {
  console.log(e)
  return (
    // @ts-ignore
    errors[Object.keys(errors).find(error => e.includes(error))]
  );
}