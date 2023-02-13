import { ret } from "../common";
import { EmbedBuilder } from "@discordjs/builders";

const api = "https://api.vrv.co";
// hidive was between cruncyroll and mondo before
// was between boomerang and crunchyroll before
// roosterteeth was between nicksplat and vrvselect before
export const domains = {
  api ,
  search: `${api}/disc/public/v1/US/M3/crunchyroll/-/search?`,
  premSearch: `${api}/disc/public/v1/US/M3/boomerang,crunchyroll,mondo,nicksplat,vrvselect/-/search?`,
  episodes: `${api}/cms/v2/US/M3/crunchyroll/episodes?`,
  premEpisodes: `${api}/cms/v2/US/M3/boomerang,crunchyroll,mondo,nicksplat,vrvselect/episodes?`,
  seasons: `${api}/cms/v2/US/M3/crunchyroll/seasons?`,
  premSeasons: `${api}/cms/v2/US/M3/boomerang,crunchyroll,mondo,nicksplat,vrvselect/seasons?`,
  stream: `${api}/cms/v2/US/M3/crunchyroll/videos/`,
  premStream: `${api}/cms/v2/US/M3/boomerang,crunchyroll,mondo,nicksplat,vrvselect/videos/`,
  accountPlayheads: `${api}/core/accounts/8883774/playheads?`,

  browse: `${api}/disc/public/v1/US/M3/boomerang,crunchyroll,mondo,nicksplat,vrvselect/-/browse?locale=en-US&n=20&sort_by=popularity&start=0&`

};
export interface config {
  email?: string;
  password?: string;
  lang?: string;
  debug?: boolean;
  premium?: boolean;
}
export interface getOptions {
  url?: string;
  baseUrl?: string;
  data?: any;
  note?: string;
  path?: string;
  auth?: {
    email: string;
    password: string;
  };
  body?: string;
  type?: "oauth" | "disc" | "cms";
  query?: string;
}
export interface VRVret extends ret {
  //VRV search results
  total?: any;
  items?: any;

  // VRV getCMS;
  cms_signing?: any;
  signing_policies?: any;

  // VRV choose; anime title
  title?: string;

  // VRV getStream; final expected return
  epMedia?: {
    [key: number]: {
      streamURL: string;
      epTitle: string;
      timeTaken: number;
      shortenedURL: string;
    };
  };
  timeTaken?: number;
}
export interface cache extends Record<string, any> {
  [index: string]: {
    searchQuery: string;
    searchRes: Array<string>;
    choiceID: string; // Looks like this: G6Q4CZ4PQ
    choiceTitle: string;
    aniEps: Array<string>; //Looks like this [  '1st Episode • Reincarnation, in Another World? • GDVFVNQ02',  '2nd Episode • My House, On Fire? • GKKF3ZKP2',  '3rd Episode • Earth Wyrm (Dragon), Bad News? • GVMF0V7QK']
    selEp: string; // One item from aniEps array of strings 
    embed: EmbedBuilder;
    date: Date;
    latest: EmbedBuilder
  }
}
export interface cmsSign extends Record<string, any> {
  Policy: string;
  Signature: string;
  "Key-Pair-Id": string;
}
export interface searchItem {
  __class__: string;
  __href__: string;
  __resource_key__: string;
  __links__: object;
  __actions__: object;
  type: string;
  total: number;
  items: any;
}
export interface appConfig {
  whatIsVrvVideoId: string;
  serverSideDataFetching: object;

  logger: object;

  debug: object;

  newrelic: object;

  segment: object;

  drm: object;

  payPal: object;

  darkFeatureConfig: object;

  staticDomain: string;

  assetsPath: string;

  assetsBuildPath: string;

  crunchyrollSiteUrl: string;

  baseSiteUrl: string;

  vilosPlayerUrl: string;

  cancelHappyMealUrl: string;

  cxApiParams: any;

  redirectRoutes: Array<any>;
  authorizedRoutes: Array<string>;
  availableRoutes: Array<string>;
  NODE_ENV: string;
}

export interface windowConfig {
  index: object;

  flashMessages: object;

  earlyAccess: object;

  modals: object;

  accounts: object;

  profile: object;

  temporaryProfile: object;

  bundles: object;

  subscriptionProducts: object;

  checkout: object;

  freeTrialEligibility: object;

  watch: any;

  device: any;

  partners: object;

  seriesPage: object;

  header: object;

  userActionsHistory: object;

  search: object;

  watchlist: object;

  discovery: object;

  talkbox: object;

  guestbook: object;

  userActionsFlow: object;

  fetchEnvironment: object;

  att: object;

  feeds: object;

  upNext: object;

  content: object;

  playheads: object;

  overlay: object;

  episodeSort: object;

  channels: object;

  router: object;

  sunset: object;
}

export interface mediaResource {
  CxApiClass: string;
  selfLink: string;
  json?: mediaResourceJson;
  streams: { CxApiClass: string; json: any | mediaResourceStreamsJson };
}

export interface mediaResourceJson {
  //episode metadata
  __class__: string;
  __href__: string;
  __resource_key__: string;
  __links__: {
    "episode/channel": { href: string };
    "episode/next_episode": { href: string };
    "episode/season": { href: string };
    "episode/series": { href: string };
    streams: { href: string };
  };
  __actions__: object;
  id: string;
  channel_id: string;
  series_id: string;
  series_title: string;
  season_id: string;
  season_title: string;
  season_number: number;
  episode: string;
  episode_number: number;
  sequence_number: number;
  production_episode_id: string;
  title: string;
  slug_title: string;
  description: string;
  next_episode_id?: string;
  next_episode_title?: string;
  hd_flag?: boolean;
  is_mature: boolean;
  mature_blocked: false;

  episode_air_date: string;
  is_subbed: boolean;
  is_dubbed: boolean;
  is_clip: boolean;
  seo_title: string;
  seo_description: string;
  season_tags: any[];
  available_offline: boolean;
  media_type: string;
  slug: string;
  images: object;
  duration_ms: number;
  ad_breaks: any[];
  is_premium_only?: boolean;
  listing_id?: string;
  subtitle_locales?: any[];
  playback?: string;
  availability_notes: string;
}

export interface mediaResourceStreamsJson { }
