import got, { Options } from "got";
import _ from "lodash";
import moment from "moment";
import { vrvOptions } from "../constants";
import Base64 from "crypto-js/enc-base64";
import HMACSHA1 from "crypto-js/hmac-sha1";
// @ts-ignore
import {
  appConfig,
  windowConfig,
  config,
  VRVret,
  cmsSign,
  getOptions,
  domains,
  searchItem,
  mediaResourceStreamsJson,
} from "./types";

import { gotOptions } from "../common";

import DiscordVRV from "./discordVRV";
import { percentEncode, randomNonce } from "@lib/utils/utils";

export default class VRV {
  //[key: string]: any;
  appConf: appConfig;
  windowConf: windowConfig;
  Cookie: string;
  token: string;
  tokenSecret: string;
  cmsSigning: cmsSign;
  discSigning: cmsSign;
  accSigning: cmsSign;
  options: getOptions;
  config: config;

  discordVRV: DiscordVRV;
  lastRequest: Date;

  constructor(config: config) {
    this.tokenSecret = "";
    this.cmsSigning = {
      Policy: "",
      Signature: "",
      "Key-Pair-Id": "",
    };
    this.discSigning = {
      Policy: "",
      Signature: "",
      "Key-Pair-Id": "",
    };
    (this.accSigning = {
      Policy: "",
      Signature: "",
      "Key-Pair-Id": "",
    }),
      (this.config = {
        ...vrvOptions,
        ...config,
      });

    this.lastRequest = new Date();
  }

  /**
   * @description Initialize the scraper such as get configs
   * @returns {Promise<VRVret>} This is the result
   */
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

    let streams =
      this.windowConf?.watch?.mediaResource?.streams?.json?.streams
        ?.adaptive_hls;
    if (!streams)
      return { success: false, error: "HLS streams were not available." };
    let hlsStream = streams?.[this.config.lang!] || streams?.["en-US"];

    return (
      hlsStream || {
        success: false,
        error: "Choice of language was not available in the HLS streams.",
      }
    );

    //  await auth();
  }

  /**
   * @description Get the suggested shows
   * @returns {Promise<VRVret>} This is the result
   */
  async Browse(): Promise<VRVret> {
    const checkCMS = await this.validateCMS();
    if (checkCMS?.success === false) return checkCMS;

    let browse = await this._vGetData({
      url: domains.browse,
      type: "disc",
      note: "Getting Browse",
    });
    if (!browse.success) {
      return {
        success: false,
        error: "Unable to get browse.",
      };
    }
    return { success: true, res: browse.res.body };
  }

  async search(query: string): Promise<VRVret> {
    const checkCMS = await this.validateCMS();
    if (checkCMS?.success === false) return checkCMS;
    let s = await this._vGetData({
      url: this.config.premium ? domains.premSearch : domains.search,
      note: `Searching for ${query}`,
      type: "disc",
      query: new URLSearchParams([
        ["q", query],
        ["n", "6"],
      ]).toString(),
    });
    if (!s.success)
      return { success: false, error: "Error while searching for anime" };
    s = s.res.body;
    if (s.total === 0)
      return { success: false, error: "Could not find that anime!" };
    s = s.items.filter(
      (res: searchItem): boolean => res.total > 0 && res.type === "series"
    )[0];
    if (!s)
      return {
        success: false,
        error: "Could not find a series matching that query!",
      };
      return { success: true, res: s };
  }
  async getStreams(id: string): Promise<VRVret> {
    const checkCMS = await this.validateCMS();
    if (checkCMS?.success === false) return checkCMS;
    let streams = await this._vGetData({
      url: `${
        this.config.premium ? domains.premStream : domains.stream
      }${id}/streams?`,
      note: `Getting streams for ${id}`,
      type: "cms",
    });
    if (!streams.success)
      return {
        success: false,
        error: `Error while getting the streams for ${id}`,
      };

    let streamBody: mediaResourceStreamsJson= streams.res.body;
    if (
      streamBody &&
      streamBody.streams &&
      streamBody.streams.adaptive_hls &&
      (streamBody.streams.adaptive_hls["en-US"] ||
        streamBody.streams.adaptive_hls[""])
    ) {
      let streamURL =
        (streamBody.streams.adaptive_hls["en-US"] &&
          streamBody.streams.adaptive_hls["en-US"].url) ||
        (streamBody.streams.adaptive_hls[""] &&
          streamBody.streams.adaptive_hls[""].url);

      return { success: true, res: streamURL };
    }
    return {
      success: false,
      error: "couldn't parse for a valid stream",
    };
  }
  async getEpisodes(id: string): Promise<VRVret> {
    const checkCMS = await this.validateCMS();
    if (checkCMS?.success === false) return checkCMS;

    let episodes = await this._vGetData({
      url: this.config.premium ? domains.premEpisodes : domains.episodes,
      note: `Getting EPISODES for ${id}`,
      type: "cms",
      query: new URLSearchParams({
        season_id: id,
      }).toString(),
    });
    if (!episodes.success)
      return {
        success: false,
        error: "Trouble getting episodes of the anime :(",
      };

    if (episodes.res.body.total <= 0)
      return {
        success: false,
        error: `No episodes found for ${id}`,
      };

    return {
      success: true,
      res: episodes.res.body,
    };
  }

  async getSeasons(id: string): Promise<VRVret> {
    const checkCMS = await this.validateCMS();
    if (checkCMS?.success === false) return checkCMS;

    let seasons = await this._vGetData({
      url: this.config.premium ? domains.premSeasons : domains.seasons,
      note: `Getting SEASONS for ${id}`,
      type: "cms",
      query: new URLSearchParams({
        series_id: id,
      }).toString(),
    });
    if (!seasons.success)
      return {
        success: false,
        error: "Trouble getting seasons of the anime :(",
      };

    if (seasons.res.body.total <= 0)
      return {
        success: false,
        error: `No seasons found for ${id}`,
      };

    return {
      success: true,
      res: seasons.res.body,
    };
  }
  /**
   * @description Authenticate the scraper with a premium account
   * @returns {Promise<VRVret>} This is the result
   */
  async auth(): Promise<VRVret> {
    let tokenAuth = await this._vGetData({
      path: "authenticate/by:credentials",
      note: "Token Credentials",
      auth: {
        email: this.config.email!,
        password: this.config.password!,
      },
      type: "oauth",
    });
    if (!tokenAuth.success) {
      return {
        success: false,
        error: "Unable to authenticate.",
      };
    }
    let { oauth_token, oauth_token_secret } = tokenAuth.res.body;
    this.token = oauth_token;
    this.tokenSecret = oauth_token_secret;
    return { success: true };
  }

  /**
   * @description Get the CMS signing keys for content authorization
   * @returns {Promise<VRVret>} This is the result
   */
  async _getCMS(): Promise<VRVret> {
    this.lastRequest = new Date();
    let cmsCreds = await this._vGetData({
      path: "index",
      note: "Getting CMS Token Credentials",
      type: "oauth",
    });

    if (!cmsCreds.success)
      return {
        success: false,
        error:
          "Trouble fetching cms keys. Simply retry :} If still doesn't work contact developer to fix",
      };
    cmsCreds = cmsCreds.res.body;
    if (!_.isEmpty(cmsCreds.cms_signing)) return cmsCreds.cms_signing;
    for (let signing_policy of cmsCreds.signing_policies || []) {
      let signing_path = _.pick(signing_policy, "path").path;
      if (signing_path && signing_path.startsWith("/cms/")) {
        let signName: string = _.pick(signing_policy, "name").name;
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
    if (this.cmsSigning && this.discSigning) {
      console.log("CMS credentials successfully retrieved.");
      return { success: true };
    } else
      return { success: false, error: "Could not get cms/disc signing keys." };
  }

  async validateCMS(): Promise<VRVret | void> {
    if (!this.cmsSigning.Policy) {
      let cmsSigns = await this._getCMS();
      let retries = 0;
      while (cmsSigns.success === false) {
        cmsSigns = await this._getCMS();
        retries += 1;
        if (retries >= 15) break;
      }

      if (retries >= 15) return { success: false, error: cmsSigns.error };
    }
  }
  /**
   * @description send authorized requests to VRV api using options
   * @param {getOptions} options - The options for the request
   * @returns {Promise<VRVret>} This is the result
   */
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
        "Content-Type": "application/json",
      },
    };
    if (this.options.baseUrl) {
      gOptions.prefixUrl = this.options.baseUrl;
      gOptions.url = gOptions.url.replace(/^\//, "");
    }
    if (this.options.type === "oauth") {
      let nonce = randomNonce(32);
      let time = moment().unix();
      let query: any = {
        oauth_consumer_key: this.appConf.cxApiParams["oAuthKey"],
        oauth_nonce: nonce,
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: time,
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
        percentEncode(gOptions.url.split("?")[0]),
        percentEncode(queryEncoded),
      ].join("&");
      //       console.log("[BASE STRING]: ", baseString)
      const signature = percentEncode(
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
      let sign: cmsSign = this[`${type}Signing`];
      if (!this.token || !this.tokenSecret)
        throw new Error("Did not oAuthenticate yet!");

      if (_.isEmpty(sign))
        throw new Error(`Get the index credentials for ${type} first!`);
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
      throw new Error(
        `[ERROR]: Invalid Options URL. Received ${gOptions.url} ${gOptions.method} `
      );
    }

    // debug
    gOptions.hooks = {
      beforeRequest: [
        (gotOpts: any): void => {
          if (this.config.debug) {
            console.log("[DEBUG] GOT OPTIONS:");
            console.log({
              headers: gotOpts.headers,
              method: gotOpts.method,
              body: gotOpts.body ? gotOpts.body : "None",
              to: gotOpts.url,
            });
            //     console.log(options, Object.keys(gotOpts), Object.values(gOptions));
          }
        },
      ],
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

      //@ts-ignore
      const urlForLog = `${
        gOptions.prefixUrl
          ? gOptions.prefixUrl + "/" + gOptions.url
          : gOptions.url
      }`;
      console.log(
        `[INFO] VRV requesting to  ${
          this.options.note ? "\nWith note " + this.options.note : ""
        }`
      );
      //    console.log("Request Options:", gOptions);
      if (Date.now() - this.lastRequest.getTime() > 270000) {
        // 4.5 mintues (270k ms), resets credential or else requests will be forbidden
        let cms = await this._getCMS();
        while (cms.success === false) {
          cms = await this._getCMS();
        }
      }

      let res: any = await got(gOptions as Options);

      if (res?.body?.toString()?.match(/^</)) {
        throw { name: "HTMLError", res };
      }
      this.lastRequest = new Date();

      return {
        success: true,
        res,
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
        error: error.message,
      };
    }
  }
}
