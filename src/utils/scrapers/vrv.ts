import got, {Options} from "got";
import _ from "lodash";
import moment from "moment";
import { vrvOptions } from "./constants";
import Base64 from "crypto-js/enc-base64";
import HMACSHA1 from "crypto-js/hmac-sha1";
import { cache, appConfig, windowConfig, config, VRVret, searchItem , mediaResourceJson, cmsSign, getOptions} from "../../types/VRV";
import { Message, MessageEmbed } from 'discord.js';
import { ordinate } from "../utils";
import {gotOptions } from '../../types/common';
const api = "https://api.vrv.co";
const domains = {
  api,
  search: `${api}/disc/public/v1/US/M2/crunchyroll/-/search?`,
  premSearch: `${api}/disc/public/v1/US/M2/boomerang,cartoonhangover,crunchyroll,hidive,mondo,nicksplat,roosterteeth,vrvselect/-/search?`,
  episodes: `${api}/cms/v2/US/M2/crunchyroll/episodes?`,
  premEpisodes: `${api}/cms/v2/US/M2/boomerang,cartoonhangover,crunchyroll,hidive,mondo,nicksplat,roosterteeth,vrvselect/episodes?`,
  seasons: `${api}/cms/v2/US/M2/crunchyroll/seasons?`,
  premSeasons: `${api}/cms/v2/US/M2/boomerang,cartoonhangover,crunchyroll,hidive,mondo,nicksplat,roosterteeth,vrvselect/seasons?`,
  stream: `${api}/cms/v2/US/M2/crunchyroll/videos/`,
  premStream: `${api}/cms/v2/US/M2/boomerang,cartoonhangover,crunchyroll,hidive,mondo,nicksplat,roosterteeth,vrvselect/videos/`
};
import  Bobb from "../../bot/botClass";
export default class VRV {
[key: string]: any;
  appConf: appConfig;
  windowConf: windowConfig;
  Cookie: string;
  token: string;
  tokenSecret: string;
  cmsSigning: cmsSign;
  discSigning: cmsSign;
  accSigning: cmsSign;
  cache: cache
 options: getOptions;
  // Constructor parameter types
  config: config;
  Bobb: Bobb;

  constructor(Bobb: Bobb, config: config) {
  this.tokenSecret = "";
      this.cmsSigning = {
        Policy: "",
  Signature: "",
  "Key-Pair-Id": ""
      };
      this.discSigning = {
        Policy: "",
  Signature: "",
  "Key-Pair-Id":""
      };
      this.accSigning = {
        Policy: "",
  Signature: "",
  "Key-Pair-Id": ""
      },
      this.config = {
      ...vrvOptions,
      ...config
    };
    this.Bobb = Bobb;
    this.cache = {
      
    }
  }
  async init(): Promise<VRVret | void> {
    const page = await got("https://vrv.co");

    const conf = page.body.match(
      /window\.__APP_CONFIG__\s*=\s*({.+?})(?:<\/script>|;)/gm
    );

    this.appConf = JSON.parse(conf?.[0]?.slice(24)?.slice(0, -1) || "");
    if (!this.appConf)
      return { success: false, error: "Could not get app config." };

    const wind = page.body.match(
      /window\.__INITIAL_STATE__\s*=\s*({.+?})(?:<\/script>|;)/gm
    );
    this.windowConf = JSON.parse(wind?.[0]?.slice(27)?.slice(0, -1) || "");
    if (!this.windowConf)
      return { success: false, error: "Could not get window config." };
  }
  async getEpFromUrl(url: string): Promise<VRVret | string> {
    const page = await got(url);

    const conf = page.body.match(
      /window\.__APP_CONFIG__\s*=\s*({.+?})(?:<\/script>|;)/gm
    );
    this.appConf = JSON.parse(conf?.[0]?.slice(24)?.slice(0, -1) || "");
    if (!this.appConf)
      return { success: false, error: "Could not get app config." };

    const wind = page.body.match(
      /window\.__INITIAL_STATE__\s*=\s*({.+?})(?:<\/script>|;)/gm
    );
    this.windowConf = JSON.parse(wind?.[0]?.slice(27)?.slice(0, -1) || "");
    if (!this.windowConf)
      return { success: false, error: "Could not get window config." };

    // download hls - no subs. apaptive hls has subs

    let streams = this.windowConf?.watch?.mediaResource?.streams?.json?.streams?.adaptive_hls;
    if (!streams)
      return { success: false, error: "HLS streams were not available." };
    let hlsStream = streams?.[this.config.lang!] || streams?.["en-US"];

    return (
      hlsStream || {
        success: false,
        error: "Choice of language was not available in the HLS streams."
      }
    );

    //  await auth();
  }

  async search(query: string, id: string): Promise<VRVret> {
    if (!this.cmsSigning.Policy) {
      let cmsSigns = await this._getCMS();
      if (cmsSigns.success == false)
        return { success: false, error: cmsSigns.error };
    }
    let s = await this._vGetData({
      url: this.config.premium?domains.premSearch: domains.search,
      note: `Searching for ${query}`,
      type: "disc",
      query: new URLSearchParams([["q", query], ["n", "6"]]).toString()
    });
    if (!s.success)
      return { success: false, error: "Error while searching for anime" };
    s = s.res.body;
    if (s.total === 0)
      return { success: false, error: "Could not find that anime!" };
    s = s.items.filter((res:searchItem):boolean => res.total > 0 && res.type === "series")[0];
    if (!s)
      return {
        success: false,
        error: "Could not find a series matching that query!"
      };
    let res:Array<string> = [];
    await this.Bobb.utils.asyncForEach(s.items, async (ani: {title: string, id: string}): Promise<void> => {
      let seasons = await this._vGetData({
        url: this.config.premium?domains.premSeasons: domains.seasons,
        note: `Getting seasons for ${ani.title}`,
        type: "cms",
        query: new URLSearchParams({ series_id: ani.id }).toString()
      });
      if (!seasons.success) res.push(`${ani.title} • Unable to get seasons..`);
      
      await this.Bobb.utils.asyncForEach(seasons.res.body.items, (ani: {title: string, id: string}):number =>
        res.push(`${ani.title}　•　${ani.id}`) // push returns the new length of array.
      );
    });

// importantn!! add :string as return type of this. not doing it now cuz the syntax highlighting gets ugly
    res = res.map((a:string, index:number):string => `${ordinate(index + 1)}　•　${a}`);
    this.cache[id].searchQuery = query;
    this.cache[id].searchRes = res;
    return {
      success: true,
      res
    };
  }

  async choose(choice: string, id: string): Promise<VRVret> {
    if (!choice)
      return {
        success: false,
        error: "Please input a choice from your search results."
      };
    choice = choice.toString();
   if(!this.cache[id]) this.initPerson(id);
   if (!this.cache[id].searchRes || this.cache[id].searchRes === undefined || this.cache[id].searchRes === null)
      return { success: false, error: "Please search for an anime first." };
    let ind: number | null; // index of choice id

    if (choice.slice(-2).match(/st|nd|rd|th/g)) {
      ind = parseInt(choice.slice(0, -2))
        ? parseInt(choice.slice(0, -2))
        : null;
      if (
        !ind ||
        (!this.cache[id].searchRes?.[ind - 1] &&
          !this.cache[id].searchRes?.find((i: string) => i.split("　•　")[0] === choice))
      )
        return {
          success: false,
          error: "Make sure the ordinal id input is correct!"
        };

      this.cache[id].choiceID = this.cache[id].searchRes?.[ind - 1].split("　•　")[2];
      this.cache[id].choiceTitle = this.cache[id].searchRes?.[ind - 1].split("　•　")[1];
    } else if (typeof parseInt(choice) === "number") {
      ind = parseInt(choice);
      if (!ind || !this.cache[id].searchRes?.[ind - 1])
        return { success: false, error: "Make sure the  id input is correct!" };
      this.cache[id].choiceID = this.cache[id].searchRes?.[ind - 1].split("　•　")[2];
      this.cache[id].choiceTitle = this.cache[id].searchRes?.[ind - 1].split("　•　")[1];
    } else return { success: false, error: "Did not receive an ok choice.." };
    if (!this.cache[id].choiceID || !this.cache[id].choiceTitle)
      return {
        success: false,
        error: "Something happened while choosing that anime :<"
      };
    let episodes = await this._vGetData({
      url:this.config.premium? domains.premEpisodes: domains.episodes,
      note: `Getting episodes for ${this.cache[id].choiceTitle}`,
      type: "cms",
      query: new URLSearchParams({ season_id: this.cache[id].choiceID! }).toString()
    });
    if (!episodes.success)
      return {
        success: false,
        error: "Trouble getting episodes of the anime you chose :("
      };
    if (episodes.res.body.total <= 0)
      return {
        success: false,
        error: `No episodes found for ${this.cache[id].choiceTitle}`
      };

    this.cache[id].aniEps = episodes.res.body.items.map(
      (ep: mediaResourceJson, index:number):string =>
        `${ordinate(index + 1)} Episode　•　${ep.title}　•　${
          ep.__links__.streams.href.split("/")[
            ep.__links__.streams.href.split("/").length - 2
          ]
        }`
    );
    return { success: true, res: this.cache[id].aniEps, title: this.cache[id].choiceTitle };
  }
  async getStream(ep: string, message: Message, id: string): Promise<VRVret> {
    let st = Date.now();
    ep = ep.toString();
    if (!this.cache[id].choiceID || !this.cache[id].choiceTitle || !this.cache[id].aniEps)
      return { success: false, error: "Please choose an anime first!" };
    let epNum;
    ep.slice(-2).match(/st|nd|rd|th/g)
      ? (epNum = parseInt(ep.slice(0, -2)))
      : (epNum = parseInt(ep));
    if (typeof epNum !== "number" || !this.cache[id].aniEps?.[epNum - 1])
      return {
        success: false,
        error: `Input a valid episode number from the list. It could be \`${
          this.cache[id].aniEps?.[1].split(" ")[0]
        }\` or \`${this.cache[id].aniEps?.[1]
          .split(" ")[0]
          .slice(0, -2)}\` to get the second episode.`
      };

    this.cache[id].selEp = this.cache[id]!.aniEps?.[epNum - 1];
    if (!this.cache[id].selEp)
      return {
        success: false,
        error: `Input a valid episode number from the list.`
      };
let epGetStart = Date.now();
    let streams = await this._vGetData({
      url: `${this.config.premium?domains.premStream: domains.stream}${this.cache[id]!.selEp?.split("　•　")[2]}/streams?`,
      note: `Getting streams for ${this.cache[id]!.selEp?.split("　•　")[1]}`,
      type: "cms"
    });
    if (!streams.success)
      return {
        success: false,
        error: `Error while getting the streams for ${
          this.cache[id].selEp?.split("　•　")[1]
        }`
      };

    let streamBody = streams.res.body;
    if (
      streamBody &&
      streamBody.streams &&
      streamBody.streams.adaptive_hls &&
      (streamBody.streams.adaptive_hls["en-US"] ||
        streamBody.streams.adaptive_hls[""])
    )
      return {
        message,
        success: true,
        epMedia: {
          [epNum]: {
            streamURL:
              (streamBody.streams.adaptive_hls["en-US"] &&
                streamBody.streams.adaptive_hls["en-US"].url) ||
              (streamBody.streams.adaptive_hls[""] &&
                streamBody.streams.adaptive_hls[""].url),
            epTitle: this.cache[id].selEp?.split("　•　")[1],
            timeTaken: Date.now() - epGetStart
          }
        },
      timeTaken: Date.now() - st
      };
    else return { success: false, error: "Trouble parsing for streams." };
}
initPerson(id: string) {
  this.cache[id] = {}
   /* searchQuery: string,
  searchRes: Array<string>,
  choiceID: string,
  choiceTitle: string,
  aniEps: Array<string>,
selEp: string,
    embed: MessageEmbed,
    date: Date
  }*/
}
setCacheEmbed(id: string, embed: MessageEmbed) {
 if(!this.cache[id]) throw new Error(`did not initperson ${id} yet.`)
  this.cache[id].embed = embed;
  this.cache[id].date = new Date();
}
  async auth(): Promise<VRVret> {
    let tokenAuth = await this._vGetData({
      path: "authenticate/by:credentials",
      note: "Token Credentials",
      auth: {
        email: this.config.email!,
        password: this.config.password!
      },
      type: "oauth"
    });
    if (!tokenAuth.success) {
      return {
        success: false,
        error: "Unable to authenticate."
      };
    }
    let { oauth_token, oauth_token_secret } = tokenAuth.res.body;
    this.token = oauth_token;
    this.tokenSecret = oauth_token_secret;
    return { success: true };
  }

  async _getCMS(): Promise<VRVret> {
    let cmsCreds = await this._vGetData({
      path: "index",
      note: "Getting CMS Token Credentials",
      type: "oauth"
    });
    if (!cmsCreds.success)
      return { success: false, error: "Trouble fetching cms keys." };
cmsCreds = cmsCreds.res.body;
    if (!_.isEmpty(cmsCreds.cms_signing)) return cmsCreds.cms_signing;
    for (let signing_policy of cmsCreds.signing_policies || []) {
      let signing_path = _.pick(signing_policy, "path").path;
      if (signing_path && signing_path.startsWith("/cms/")) {
        let signName:string= _.pick(signing_policy, "name").name;
        let value: string = _.pick(signing_policy, "value").value;
        if (signName && value) this.cmsSigning[signName] = value;
      } else if (
        signing_path &&
        signing_path.startsWith("/disc/") &&
        signing_path.endsWith("-")
      ) {
        let signName: string = _.pick(signing_policy, "name").name;
        let value: string = _.pick(signing_policy, "value").value;

        if (signName && value) this.discSigning[signName] = value;
      } else if (
        signing_path &&
        signing_path.startsWith("/disc/") &&
        signing_path.endsWith("8883774")
      ) {
        let signName = _.pick(signing_policy, "name").name;
        let value = _.pick(signing_policy, "value").value;

        if (signName && value) this.accSigning[signName] = value;
      }
    }
   if(this.cmsSigning && this.discSigning) return { success: true };
else return {success: false, error: "Could not get cms/disc signing keys."}
  }
  async _vGetData(options: getOptions): Promise<VRVret> {
    this.options = options;
    if (this.options.note) console.log("Request note:", this.options.note);
    let gOptions: gotOptions = {
      url: (this.options.path
        ? `${domains.api}/core/${this.options.path}`
        : this.options.url)!,
      method: "GET",
      responseType: "json",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:70.0) Gecko/20100101 Firefox/70.0",
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      }
    };
    if (this.options.baseUrl) {
      gOptions.prefixUrl = this.options.baseUrl;
      gOptions.url = gOptions.url.replace(/^\//, "");
    }
    if (this.options.type === "oauth") {
      let nonce = this.Bobb.utils.randomNonce(32);
      let time = moment().unix();
      let query:any = {
        oauth_consumer_key: this.appConf.cxApiParams["oAuthKey"],
        oauth_nonce: nonce,
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: time
      };
      if (this.token) query.oauth_token = this.token;
      if (this.options.auth || this.options.data || this.options.body) {
        gOptions.method = "POST";
        gOptions.body = JSON.stringify(
          this.options.auth || this.options.data || this.options.body
        );
      }
      let queryEncoded = new URLSearchParams(query).toString();
      //   console.log("[QUERY]: ", queryEncoded)
   //   let newURL = new URL(`${gOptions.url}?${queryEncoded}`);

      // First step to get the OAuth Signature - Url Encode the method, base url (https://d.com/bruh), then query from above (you=me) [
      let baseString = [
        gOptions.method.toUpperCase(),
        this.Bobb.utils.percentEncode(gOptions.url.split("?")[0]),
        this.Bobb.utils.percentEncode(queryEncoded)
      ].join("&");
  //       console.log("[BASE STRING]: ", baseString)
      const signature = this.Bobb.utils.percentEncode(
        Base64.stringify(
          HMACSHA1(
            baseString,
            Buffer.from(
              this.appConf.cxApiParams["oAuthSecret"] + "&" + this.tokenSecret,
              "ascii"
            ).toString()
          )
        )
      );
      // Last step to get the OAuth Signature - HMAC SHA1 Hash the Base_String with the secret key oAuthSecret ]

 //      console.log("[SIGNATURE KEY] ", signature, "Token Secret:", this.tokenSecret)
     queryEncoded += "&oauth_signature=" + signature;
      gOptions.url = [gOptions.url, queryEncoded].join("?");

      /*   let OAuth = `oauth_consumer_key="${
      this.appConf.cxApiParams["oAuthKey"]
    }", oauth_nonce="${nonce}", oauth_signature="${signature}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${time}", oauth_version="1.0"`;
    gOptions.headers.Authorization = `OAuth ${OAuth}`;*/
    } else if (
      this.options.type === "cms" ||
      this.options.type === "disc" ||
      this.options.type === "acc"
    ) {
      let type = this.options.type;
      let sign : cmsSign= this[`${type}Signing`];
      if (!this.token || !this.tokenSecret) throw new Error("Did not oAuthenticate yet!");

      if (_.isEmpty(sign)) throw new Error(`Get the index credentials for ${type} first!`);
      // can not do it here because it replaces the current options for query etc.

      if (this.options.query)
        gOptions.url.endsWith("?")
          ? (gOptions.url += this.options.query)
          : (gOptions.url += `?${this.options.query}`);
      let signQuery = new URLSearchParams(sign).toString();

      gOptions.url.endsWith("&")
        ? (gOptions.url += signQuery)
        : gOptions.url.endsWith("?")
        ? (gOptions.url += `${signQuery}`)
        : (gOptions.url += `&${signQuery}`);
    } else {
      throw new Error(`[ERROR]: Invalid Options URL. Received ${gOptions.url} ${gOptions.method} `);
    }

    
    // debug
    gOptions.hooks = {
      beforeRequest: [
        (gotOpts:any):void=> {
          if (this.config.debug) {
            console.log("[DEBUG] GOT OPTIONS:");
            console.log({
              headers: gotOpts.headers,
              method: gotOpts.method,
              body: gotOpts.body ? gotOpts.body : "None",
              to: gotOpts.url
            });
            //     console.log(options, Object.keys(gotOpts), Object.values(gOptions));
          }
        }
      ]
    };
    try {
  /*    console.log(
        "[INFO] Requesting to",
        `${
          gOptions.prefixUrl
            ? gOptions.prefixUrl + "/" + gOptions.url
            : gOptions.url
        }`
      );*/
      await this.Bobb.loggers.log(
        `[INFO] VRV requesting to ${
          gOptions.prefixUrl
            ? gOptions.prefixUrl + "/" + gOptions.url
            : gOptions.url
        } ${this.options.note? "\nWith note " + this.options.note: ""}`,
        "VRV Request to"
      );
  //    console.log("Request Options:", gOptions);
      let res: any = await got(gOptions as Options);
      if ( res?.body?.toString()?.match(/^</)) {
        throw { name: "HTMLError", res };
      }
      return {
        success: true,
        res
      };
    } catch (error) {
      if (this.config.debug) {
        console.log(error);
      }
      if (
        error.response &&
        error.response.statusCode &&
        error.response.statusMessage
      ) {
        console.log(
          `[ERROR] ${error.name} ${error.response.statusCode}: ${error.response.statusMessage}`
        );
      } else if (
        error.name &&
        error.name == "HTMLError" &&
        error.res &&
        error.res.body
      ) {
        console.log(`[ERROR] ${error.name}:`);
        console.log(error.res.body);
      } else {
        console.log(`[ERROR] ${error.name}: ${error.code || error.message}`);
      }
      return {
        success: false,
        error: error.message
      };
    }
  }
};
