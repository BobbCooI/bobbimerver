
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export type COMMAND_CATEGORIES = |
"all" |
"admin" |
"ani" |
"misc" |
"web";

export type COMMAND_GROUP_NAMES = |
"vrv" | 
"funi"|
"aigen";

export const COMMAND_GROUP_DESCRIPTIONS = {
"vrv": "fetch episodes from vrv content base",
"funi": "fetch episodes from funimation content base",
"aigen": "use OpenAI to generate things"
};

export const OWNER_ONLY_COMMANDS = ["bypcd"];
export enum Position {
  GUEST = "",
  BUDDY = "999445497737642035",
  MODERATOR = "999445598145089636",
  ADMIN = "999445666994602024",
}


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


export const arrows = new Map([
  ['⬅️', '%E2%AC%85%EF%B8%8F%20'],
  ['➡️', '%E2%9E%A1%EF%B8%8F%20'],
  ['⏩', '%E2%8F%A9'],
  ['⏪', '%E2%8F%AA']
]);


