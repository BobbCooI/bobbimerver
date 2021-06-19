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
const got_1 = __importDefault(require("got"));
const lodash_1 = __importDefault(require("lodash"));
const moment_1 = __importDefault(require("moment"));
const constants_1 = require("./constants");
const enc_base64_1 = __importDefault(require("crypto-js/enc-base64"));
const hmac_sha1_1 = __importDefault(require("crypto-js/hmac-sha1"));
const utils_1 = require("../utils");
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
class VRV {
    constructor(Bobb, config) {
        this.tokenSecret = "";
        this.cmsSigning = {
            Policy: "",
            Signature: "",
            "Key-Pair-Id": ""
        };
        this.discSigning = {
            Policy: "",
            Signature: "",
            "Key-Pair-Id": ""
        };
        this.accSigning = {
            Policy: "",
            Signature: "",
            "Key-Pair-Id": ""
        },
            this.config = Object.assign(Object.assign({}, constants_1.vrvOptions), config);
        this.Bobb = Bobb;
        this.cache = {};
    }
    init() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield got_1.default("https://vrv.co");
            const conf = page.body.match(/window\.__APP_CONFIG__\s*=\s*({.+?})(?:<\/script>|;)/gm);
            this.appConf = JSON.parse(((_b = (_a = conf === null || conf === void 0 ? void 0 : conf[0]) === null || _a === void 0 ? void 0 : _a.slice(24)) === null || _b === void 0 ? void 0 : _b.slice(0, -1)) || "");
            if (!this.appConf)
                return { success: false, error: "Could not get app config." };
            const wind = page.body.match(/window\.__INITIAL_STATE__\s*=\s*({.+?})(?:<\/script>|;)/gm);
            this.windowConf = JSON.parse(((_d = (_c = wind === null || wind === void 0 ? void 0 : wind[0]) === null || _c === void 0 ? void 0 : _c.slice(27)) === null || _d === void 0 ? void 0 : _d.slice(0, -1)) || "");
            if (!this.windowConf)
                return { success: false, error: "Could not get window config." };
        });
    }
    getEpFromUrl(url) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield got_1.default(url);
            const conf = page.body.match(/window\.__APP_CONFIG__\s*=\s*({.+?})(?:<\/script>|;)/gm);
            this.appConf = JSON.parse(((_b = (_a = conf === null || conf === void 0 ? void 0 : conf[0]) === null || _a === void 0 ? void 0 : _a.slice(24)) === null || _b === void 0 ? void 0 : _b.slice(0, -1)) || "");
            if (!this.appConf)
                return { success: false, error: "Could not get app config." };
            const wind = page.body.match(/window\.__INITIAL_STATE__\s*=\s*({.+?})(?:<\/script>|;)/gm);
            this.windowConf = JSON.parse(((_d = (_c = wind === null || wind === void 0 ? void 0 : wind[0]) === null || _c === void 0 ? void 0 : _c.slice(27)) === null || _d === void 0 ? void 0 : _d.slice(0, -1)) || "");
            if (!this.windowConf)
                return { success: false, error: "Could not get window config." };
            let streams = (_k = (_j = (_h = (_g = (_f = (_e = this.windowConf) === null || _e === void 0 ? void 0 : _e.watch) === null || _f === void 0 ? void 0 : _f.mediaResource) === null || _g === void 0 ? void 0 : _g.streams) === null || _h === void 0 ? void 0 : _h.json) === null || _j === void 0 ? void 0 : _j.streams) === null || _k === void 0 ? void 0 : _k.adaptive_hls;
            if (!streams)
                return { success: false, error: "HLS streams were not available." };
            let hlsStream = (streams === null || streams === void 0 ? void 0 : streams[this.config.lang]) || (streams === null || streams === void 0 ? void 0 : streams["en-US"]);
            return (hlsStream || {
                success: false,
                error: "Choice of language was not available in the HLS streams."
            });
        });
    }
    search(query, id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cmsSigning.Policy) {
                let cmsSigns = yield this._getCMS();
                if (cmsSigns.success == false)
                    return { success: false, error: cmsSigns.error };
            }
            let s = yield this._vGetData({
                url: this.config.premium ? domains.premSearch : domains.search,
                note: `Searching for ${query}`,
                type: "disc",
                query: new URLSearchParams([["q", query], ["n", "6"]]).toString()
            });
            if (!s.success)
                return { success: false, error: "Error while searching for anime" };
            s = s.res.body;
            if (s.total === 0)
                return { success: false, error: "Could not find that anime!" };
            s = s.items.filter((res) => res.total > 0 && res.type === "series")[0];
            if (!s)
                return {
                    success: false,
                    error: "Could not find a series matching that query!"
                };
            let res = [];
            yield this.Bobb.utils.asyncForEach(s.items, (ani) => __awaiter(this, void 0, void 0, function* () {
                let seasons = yield this._vGetData({
                    url: this.config.premium ? domains.premSeasons : domains.seasons,
                    note: `Getting seasons for ${ani.title}`,
                    type: "cms",
                    query: new URLSearchParams({ series_id: ani.id }).toString()
                });
                if (!seasons.success)
                    res.push(`${ani.title} • Unable to get seasons..`);
                yield this.Bobb.utils.asyncForEach(seasons.res.body.items, (ani) => res.push(`${ani.title}　•　${ani.id}`));
            }));
            res = res.map((a, index) => `${utils_1.ordinate(index + 1)}　•　${a}`);
            this.cache[id].searchQuery = query;
            this.cache[id].searchRes = res;
            return {
                success: true,
                res
            };
        });
    }
    choose(choice, id) {
        var _a, _b, _c, _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function* () {
            if (!choice)
                return {
                    success: false,
                    error: "Please input a choice from your search results."
                };
            choice = choice.toString();
            if (!this.cache[id])
                this.initPerson(id);
            if (!this.cache[id].searchRes || this.cache[id].searchRes === undefined || this.cache[id].searchRes === null)
                return { success: false, error: "Please search for an anime first." };
            let ind;
            if (choice.slice(-2).match(/st|nd|rd|th/g)) {
                ind = parseInt(choice.slice(0, -2))
                    ? parseInt(choice.slice(0, -2))
                    : null;
                if (!ind ||
                    (!((_a = this.cache[id].searchRes) === null || _a === void 0 ? void 0 : _a[ind - 1]) &&
                        !((_b = this.cache[id].searchRes) === null || _b === void 0 ? void 0 : _b.find((i) => i.split("　•　")[0] === choice))))
                    return {
                        success: false,
                        error: "Make sure the ordinal id input is correct!"
                    };
                this.cache[id].choiceID = (_c = this.cache[id].searchRes) === null || _c === void 0 ? void 0 : _c[ind - 1].split("　•　")[2];
                this.cache[id].choiceTitle = (_d = this.cache[id].searchRes) === null || _d === void 0 ? void 0 : _d[ind - 1].split("　•　")[1];
            }
            else if (typeof parseInt(choice) === "number") {
                ind = parseInt(choice);
                if (!ind || !((_e = this.cache[id].searchRes) === null || _e === void 0 ? void 0 : _e[ind - 1]))
                    return { success: false, error: "Make sure the  id input is correct!" };
                this.cache[id].choiceID = (_f = this.cache[id].searchRes) === null || _f === void 0 ? void 0 : _f[ind - 1].split("　•　")[2];
                this.cache[id].choiceTitle = (_g = this.cache[id].searchRes) === null || _g === void 0 ? void 0 : _g[ind - 1].split("　•　")[1];
            }
            else
                return { success: false, error: "Did not receive an ok choice.." };
            if (!this.cache[id].choiceID || !this.cache[id].choiceTitle)
                return {
                    success: false,
                    error: "Something happened while choosing that anime :<"
                };
            let episodes = yield this._vGetData({
                url: this.config.premium ? domains.premEpisodes : domains.episodes,
                note: `Getting episodes for ${this.cache[id].choiceTitle}`,
                type: "cms",
                query: new URLSearchParams({ season_id: this.cache[id].choiceID }).toString()
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
            this.cache[id].aniEps = episodes.res.body.items.map((ep, index) => `${utils_1.ordinate(index + 1)} Episode　•　${ep.title}　•　${ep.__links__.streams.href.split("/")[ep.__links__.streams.href.split("/").length - 2]}`);
            return { success: true, res: this.cache[id].aniEps, title: this.cache[id].choiceTitle };
        });
    }
    getStream(ep, message, id) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            let st = Date.now();
            ep = ep.toString();
            if (!this.cache[id].choiceID || !this.cache[id].choiceTitle || !this.cache[id].aniEps)
                return { success: false, error: "Please choose an anime first!" };
            let epNum;
            ep.slice(-2).match(/st|nd|rd|th/g)
                ? (epNum = parseInt(ep.slice(0, -2)))
                : (epNum = parseInt(ep));
            if (typeof epNum !== "number" || !((_a = this.cache[id].aniEps) === null || _a === void 0 ? void 0 : _a[epNum - 1]))
                return {
                    success: false,
                    error: `Input a valid episode number from the list. It could be \`${(_b = this.cache[id].aniEps) === null || _b === void 0 ? void 0 : _b[1].split(" ")[0]}\` or \`${(_c = this.cache[id].aniEps) === null || _c === void 0 ? void 0 : _c[1].split(" ")[0].slice(0, -2)}\` to get the second episode.`
                };
            this.cache[id].selEp = (_d = this.cache[id].aniEps) === null || _d === void 0 ? void 0 : _d[epNum - 1];
            if (!this.cache[id].selEp)
                return {
                    success: false,
                    error: `Input a valid episode number from the list.`
                };
            let epGetStart = Date.now();
            let streams = yield this._vGetData({
                url: `${this.config.premium ? domains.premStream : domains.stream}${(_e = this.cache[id].selEp) === null || _e === void 0 ? void 0 : _e.split("　•　")[2]}/streams?`,
                note: `Getting streams for ${(_f = this.cache[id].selEp) === null || _f === void 0 ? void 0 : _f.split("　•　")[1]}`,
                type: "cms"
            });
            if (!streams.success)
                return {
                    success: false,
                    error: `Error while getting the streams for ${(_g = this.cache[id].selEp) === null || _g === void 0 ? void 0 : _g.split("　•　")[1]}`
                };
            let streamBody = streams.res.body;
            if (streamBody &&
                streamBody.streams &&
                streamBody.streams.adaptive_hls &&
                (streamBody.streams.adaptive_hls["en-US"] ||
                    streamBody.streams.adaptive_hls[""]))
                return {
                    message,
                    success: true,
                    epMedia: {
                        [epNum]: {
                            streamURL: (streamBody.streams.adaptive_hls["en-US"] &&
                                streamBody.streams.adaptive_hls["en-US"].url) ||
                                (streamBody.streams.adaptive_hls[""] &&
                                    streamBody.streams.adaptive_hls[""].url),
                            epTitle: (_h = this.cache[id].selEp) === null || _h === void 0 ? void 0 : _h.split("　•　")[1],
                            timeTaken: Date.now() - epGetStart
                        }
                    },
                    timeTaken: Date.now() - st
                };
            else
                return { success: false, error: "Trouble parsing for streams." };
        });
    }
    initPerson(id) {
        this.cache[id] = {};
    }
    setCacheEmbed(id, embed) {
        if (!this.cache[id])
            throw `did not initperson ${id} yet.`;
        this.cache[id].embed = embed;
        this.cache[id].date = new Date();
    }
    auth() {
        return __awaiter(this, void 0, void 0, function* () {
            let tokenAuth = yield this._vGetData({
                path: "authenticate/by:credentials",
                note: "Token Credentials",
                auth: {
                    email: this.config.email,
                    password: this.config.password
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
        });
    }
    _getCMS() {
        return __awaiter(this, void 0, void 0, function* () {
            let cmsCreds = yield this._vGetData({
                path: "index",
                note: "Getting CMS Token Credentials",
                type: "oauth"
            });
            if (!cmsCreds.success)
                return { success: false, error: "Trouble fetching cms keys." };
            cmsCreds = cmsCreds.res.body;
            if (!lodash_1.default.isEmpty(cmsCreds.cms_signing))
                return cmsCreds.cms_signing;
            for (let signing_policy of cmsCreds.signing_policies || []) {
                let signing_path = lodash_1.default.pick(signing_policy, "path").path;
                if (signing_path && signing_path.startsWith("/cms/")) {
                    let signName = lodash_1.default.pick(signing_policy, "name").name;
                    let value = lodash_1.default.pick(signing_policy, "value").value;
                    if (signName && value)
                        this.cmsSigning[signName] = value;
                }
                else if (signing_path &&
                    signing_path.startsWith("/disc/") &&
                    signing_path.endsWith("-")) {
                    let signName = lodash_1.default.pick(signing_policy, "name").name;
                    let value = lodash_1.default.pick(signing_policy, "value").value;
                    if (signName && value)
                        this.discSigning[signName] = value;
                }
                else if (signing_path &&
                    signing_path.startsWith("/disc/") &&
                    signing_path.endsWith("8883774")) {
                    let signName = lodash_1.default.pick(signing_policy, "name").name;
                    let value = lodash_1.default.pick(signing_policy, "value").value;
                    if (signName && value)
                        this.accSigning[signName] = value;
                }
            }
            if (this.cmsSigning && this.discSigning)
                return { success: true };
            else
                return { success: false, error: "Could not get cms/disc signing keys." };
        });
    }
    _vGetData(options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.options = options;
            if (this.options.note)
                console.log("Request note:", this.options.note);
            let gOptions = {
                url: (this.options.path
                    ? `${domains.api}/core/${this.options.path}`
                    : this.options.url),
                method: "GET",
                responseType: "json",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:70.0) Gecko/20100101 Firefox/70.0",
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
                let time = moment_1.default().unix();
                let query = {
                    oauth_consumer_key: this.appConf.cxApiParams["oAuthKey"],
                    oauth_nonce: nonce,
                    oauth_signature_method: "HMAC-SHA1",
                    oauth_timestamp: time
                };
                if (this.token)
                    query.oauth_token = this.token;
                if (this.options.auth || this.options.data || this.options.body) {
                    gOptions.method = "POST";
                    gOptions.body = JSON.stringify(this.options.auth || this.options.data || this.options.body);
                }
                let queryEncoded = new URLSearchParams(query).toString();
                let baseString = [
                    gOptions.method.toUpperCase(),
                    this.Bobb.utils.percentEncode(gOptions.url.split("?")[0]),
                    this.Bobb.utils.percentEncode(queryEncoded)
                ].join("&");
                const signature = this.Bobb.utils.percentEncode(enc_base64_1.default.stringify(hmac_sha1_1.default(baseString, Buffer.from(this.appConf.cxApiParams["oAuthSecret"] + "&" + this.tokenSecret, "ascii").toString())));
                queryEncoded += "&oauth_signature=" + signature;
                gOptions.url = [gOptions.url, queryEncoded].join("?");
            }
            else if (this.options.type === "cms" ||
                this.options.type === "disc" ||
                this.options.type === "acc") {
                let type = this.options.type;
                let sign = this[`${type}Signing`];
                if (!this.token || !this.tokenSecret)
                    throw "Did not oAuthenticate yet!";
                if (lodash_1.default.isEmpty(sign))
                    throw `Get the index credentials for ${type} first!`;
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
            }
            else {
                throw `[ERROR]: Invalid Options URL. Received ${gOptions.url} ${gOptions.method} `;
            }
            gOptions.hooks = {
                beforeRequest: [
                    (gotOpts) => {
                        if (this.config.debug) {
                            console.log("[DEBUG] GOT OPTIONS:");
                            console.log({
                                headers: gotOpts.headers,
                                method: gotOpts.method,
                                body: gotOpts.body ? gotOpts.body : "None",
                                to: gotOpts.url
                            });
                        }
                    }
                ]
            };
            try {
                yield this.Bobb.loggers.log(`[INFO] VRV requesting to ${gOptions.prefixUrl
                    ? gOptions.prefixUrl + "/" + gOptions.url
                    : gOptions.url} ${this.options.note ? "\nWith note " + this.options.note : ""}`, "VRV Request to");
                let res = yield got_1.default(gOptions);
                if ((_b = (_a = res === null || res === void 0 ? void 0 : res.body) === null || _a === void 0 ? void 0 : _a.toString()) === null || _b === void 0 ? void 0 : _b.match(/^</)) {
                    throw { name: "HTMLError", res };
                }
                return {
                    success: true,
                    res
                };
            }
            catch (error) {
                if (this.config.debug) {
                    console.log(error);
                }
                if (error.response &&
                    error.response.statusCode &&
                    error.response.statusMessage) {
                    console.log(`[ERROR] ${error.name} ${error.response.statusCode}: ${error.response.statusMessage}`);
                }
                else if (error.name &&
                    error.name == "HTMLError" &&
                    error.res &&
                    error.res.body) {
                    console.log(`[ERROR] ${error.name}:`);
                    console.log(error.res.body);
                }
                else {
                    console.log(`[ERROR] ${error.name}: ${error.code || error.message}`);
                }
                return {
                    success: false,
                    error: error.message
                };
            }
        });
    }
}
exports.default = VRV;
;
//# sourceMappingURL=vrv.js.map