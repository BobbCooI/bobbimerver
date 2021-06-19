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
const api_host = process.env.funiApiHost;
const token = process.env.funiToken;
const m3u8 = require("m3u8-parsed");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const helpers_1 = require("./helpers");
let fnTitle = "", fnEpNum = "", fnSuffix = "", fnOutput = "", tsDlPath = false, stDlPath = false, batchDL = false;
function edit(which, content, Bobb) {
    return __awaiter(this, void 0, void 0, function* () {
        if (which === null || which === void 0 ? void 0 : which.commandName) {
            yield which.editReply(content);
        }
        else {
            yield which.edit(content);
        }
    });
}
module.exports = {
    auth() {
        return __awaiter(this, void 0, void 0, function* () {
            let authOpts = {};
            authOpts.user = process.env.funiEmail;
            authOpts.pass = process.env.funiPass;
            let authData = yield helpers_1.getFuniData({
                baseUrl: api_host,
                url: "/auth/login/",
                useProxy: true,
                auth: authOpts
            });
            if (authData.ok) {
                authData = helpers_1.parseJsonData(authData.res.body);
                if (authData.token) {
                    console.log("[INFO] Authentication success, your token: %s\n", authData.token);
                }
                else if (authData.error) {
                    console.log("[ERROR]%s\n", authData.error);
                    process.exit(1);
                }
            }
        });
    },
    getShow(Bobb, message, titleId, get = "latest", options) {
        return __awaiter(this, void 0, void 0, function* () {
            let start = Date.now();
            let text = `beginning... ${utils_1.randomNumber(5, 10)}%`;
            yield edit(message, text, Bobb);
            let ret = { epMedia: {} };
            let showData = yield helpers_1.getFuniData({
                baseUrl: api_host,
                url: `/source/catalog/title/${parseInt(titleId, 10)}`,
                token: token,
                useToken: true,
                useProxy: true
            });
            if (!showData.ok) {
                return { success: false, error: "could not catalog title id" };
            }
            showData = helpers_1.parseJsonData(showData.res.body);
            if (showData.status) {
                let err = `[ERROR] Error #${showData.status}: ${showData.data.errors[0].detail}\n`;
                console.log(err);
                ret.error = err;
                ret.success = false;
                return ret;
            }
            else if (!showData.items || showData.items.length < 1) {
                console.log("[ERROR] Show not found\n");
                ret.error = "Show not found!";
                ret.success = false;
                return ret;
            }
            showData = showData.items[0];
            ret.poster = showData.poster;
            text = `got show... ${utils_1.randomNumber(15, 26)}%`;
            yield edit(message, text, Bobb);
            let qs = {
                limit: get == "latest" ? 1 : -1,
                sort: "order",
                sort_direction: get == "latest" ? "DESC" : "ASC",
                title_id: parseInt(titleId, 10)
            };
            qs.language = "English";
            let episodesData = yield helpers_1.getFuniData({
                baseUrl: api_host,
                url: "/funimation/episodes/",
                querystring: qs,
                token: token,
                useToken: true,
                useProxy: true
            });
            if (!episodesData.ok) {
                return { success: false, error: "could not get episodes" };
            }
            let eps = helpers_1.parseJsonData(episodesData.res.body).items, is_selected = false;
            get =
                get == "latest"
                    ? ["latest"]
                    : get.toString().match(",")
                        ? get.toString().split(",")
                        : [get.toString()];
            let epSelList = get, epSelRanges = [], fnSlug = [], epSelEps = [];
            text = `parsing.. ${utils_1.randomNumber(27, 40)}%`;
            yield edit(message, text, Bobb);
            epSelList = epSelList.map(e => {
                if (e.match("-")) {
                    e = e.split("-");
                    if (e[0].match(/^(?:[A-Z]|)\d+$/i) && e[1].match(/^\d+$/)) {
                        e[0] = e[0].replace(/^(?:([A-Z])|)(0+)/i, "$1");
                        let letter = e[0].match(/^([A-Z])\d+$/i)
                            ? e[0].match(/^([A-Z])\d+$/i)[1].toUpperCase()
                            : "";
                        e[0] = e[0].replace(/^[A-Z](\d+)$/i, "$1");
                        e[0] = parseInt(e[0]);
                        e[1] = parseInt(e[1]);
                        if (e[0] < e[1]) {
                            for (let i = e[0]; i < e[1] + 1; i++) {
                                epSelRanges.push(letter + i);
                            }
                            return "";
                        }
                        else {
                            return letter + e[0];
                        }
                    }
                    else {
                        return "";
                    }
                }
                else if (e.match(/^(?:[A-Z]|)\d+$/i)) {
                    return e.replace(/^(?:([A-Z])|)(0+)/i, "$1").toUpperCase();
                }
                else {
                    return "";
                }
            });
            epSelList = [...new Set(epSelList.concat(epSelRanges))];
            for (let e in eps) {
                let showStrId = eps[e].ids.externalShowId;
                let epStrId = eps[e].ids.externalEpisodeId.replace(new RegExp("^" + showStrId), "");
                let data = {
                    [eps[e].item.episodeNum]: {
                        titleName: eps[e].item.titleName,
                        titleSlug: eps[e].item.titleSlug,
                        episodeSlug: eps[e].item.episodeSlug,
                        episodeName: eps[e].item.episodeName,
                        episodeNum: eps[e].item.episodeNum,
                        episodeId: eps[e].item.episodeId
                    }
                };
                if (epSelList.includes(epStrId.replace(/^(?:([A-Z])|)(0+)/, "$1"))) {
                    fnSlug.push(data);
                    ret.epMedia = Object.assign(Object.assign({}, ret.epMedia), data);
                    epSelEps.push(epStrId);
                    is_selected = true;
                }
                else if (get == "latest") {
                    ret.epMedia = Object.assign(Object.assign({}, ret.epMedia), data);
                    fnSlug.push(data);
                    epSelEps.push(get);
                    is_selected = true;
                }
                else {
                    is_selected = false;
                }
                let tx_snum = eps[e].item.seasonNum == 1 ? "" : ` S${eps[e].item.seasonNum}`;
                let tx_type = eps[e].mediaCategory != "episode" ? eps[e].mediaCategory : "";
                let tx_enum = eps[e].item.episodeNum !== ""
                    ? `#${(eps[e].item.episodeNum < 10 ? "0" : "") +
                        eps[e].item.episodeNum}`
                    : "#" + eps[e].item.episodeId;
                let qua_str = eps[e].quality.height
                    ? eps[e].quality.quality + eps[e].quality.height
                    : "UNK";
                let aud_str = eps[e].audio.length > 0 ? `, ${eps[e].audio.join(", ")}` : "";
                let rtm_str = eps[e].item.runtime !== "" ? eps[e].item.runtime : "??:??";
                let episodeIdStr = epStrId;
                let conOut = `[${episodeIdStr}] `;
                conOut += `${eps[e].item.titleName + tx_snum} - ${tx_type + tx_enum} ${eps[e].item.episodeName} `;
                conOut += `(${rtm_str}) [${qua_str + aud_str}]`;
                conOut += is_selected ? " (selected)" : "";
                conOut += eps.length - 1 == e ? "\n" : "";
            }
            if (fnSlug.length > 1) {
                batchDL = true;
            }
            if (fnSlug.length < 1) {
                console.log("[INFO] Episodes not selected or found!\n");
                ret.error = "Episodes not selected or found!";
                ret.success = false;
                return ret;
            }
            else {
                text = `getting eps.. ${utils_1.randomNumber(45, 60)}%`;
                yield edit(message, text, Bobb);
                let appT = text;
                for (let ep in ret.epMedia) {
                    let vData = yield module.exports.getEpisode(Bobb, {
                        titleSlug: ret.epMedia[ep].titleSlug,
                        episodeSlug: ret.epMedia[ep].episodeSlug
                    }, options, message, appT);
                    ret.epMedia[ep].tTime = Date.now() - start;
                    ret.epMedia[ep].vData = vData;
                    appT = vData.text;
                }
            }
            return ret;
        });
    },
    getEpisode(Bobb, data, options, message, text) {
        return __awaiter(this, void 0, void 0, function* () {
            let start = Date.now();
            let episodeData = yield helpers_1.getFuniData({
                baseUrl: api_host,
                url: `/source/catalog/episode/${data.titleSlug}/${data.episodeSlug}/`,
                token: token,
                useToken: true,
                useProxy: true
            });
            text += `\n${data.episodeSlug} - ${utils_1.randomNumber(1, 10)}%`;
            yield edit(message, text, Bobb);
            if (!episodeData.ok) {
                return {
                    success: false,
                    error: "Unable to get video",
                    text: (text += ": Unable to get video")
                };
            }
            let ep = helpers_1.parseJsonData(episodeData.res.body).items[0], streamId = 0;
            fnTitle = options.overrideTitle ? options.overrideTitle : ep.parent.title;
            ep.number = isNaN(ep.number)
                ? ep.number
                : parseInt(ep.number, 10) < 10
                    ? "0" + ep.number
                    : ep.number;
            if (ep.mediaCategory != "Episode") {
                ep.number =
                    ep.number !== ""
                        ? ep.mediaCategory + ep.number
                        : ep.mediaCategory + "#" + ep.id;
            }
            fnEpNum =
                options.overrideEp && !batchDL
                    ? parseInt(ep, 10) < 10
                        ? "0" + options.overrideEp
                        : options.overrideEp
                    : ep.number;
            let uncut = {
                Japanese: false,
                English: false
            };
            console.log("[INFO] %s - S%sE%s - %s", ep.parent.title, ep.parent.seasonNumber ? ep.parent.seasonNumber : "?", ep.number ? ep.number : "?", ep.title);
            let media = ep.media.map(function (m) {
                if (m.mediaType == "experience") {
                    if (m.version.match(/uncut/i)) {
                        uncut[m.language] = true;
                    }
                    return {
                        id: m.id,
                        language: m.language,
                        version: m.version,
                        type: m.experienceType,
                        subtitles: module.exports.getSubsUrl(m.mediaChildren)
                    };
                }
                else {
                    return { id: 0, type: "" };
                }
            });
            text = text.slice(0, -3);
            text += `${utils_1.randomNumber(15, 40)}%`;
            yield edit(message, text, Bobb);
            media = media.reverse();
            for (let m of media) {
                let selected = false;
                let force;
                if (m.id > 0 && m.type == "Non-Encrypted") {
                    let dub_type = m.language;
                    if (dub_type == "Japanese" && options.enSub) {
                        streamId = m.id;
                        stDlPath = m.subtitles;
                        selected = true;
                    }
                    else if (dub_type == "English" && !options.enSub) {
                        streamId = m.id;
                        stDlPath = m.subtitles;
                        selected = true;
                    }
                    if (!selected) {
                        streamId = m.id;
                        stDlPath = m.subtitles;
                        selected = true;
                        force = true;
                        options.force = "No sub version found. Getting dub then...";
                    }
                }
            }
            if (streamId < 1) {
                console.log("[ERROR] Track not selected\n");
                return {
                    success: false,
                    error: "Track not selected or there are no hard english subs",
                    text: (text += ": Track not selected or there are no hard english subs")
                };
            }
            else {
                let streamData = yield helpers_1.getFuniData({
                    baseUrl: api_host,
                    url: `/source/catalog/video/${streamId}/signed`,
                    token: token,
                    dinstid: "uuid",
                    useToken: true,
                    useProxy: true
                });
                if (!streamData.ok) {
                    return {
                        success: false,
                        error: "Unable to get stream data.",
                        text: (text += ": Unable to get stream data.")
                    };
                }
                streamData = helpers_1.parseJsonData(streamData.res.body);
                options.tsDlPath = false;
                if (streamData.errors) {
                    console.log("[ERROR] Error #%s: %s\n", streamData.errors[0].code, streamData.errors[0].detail);
                    return {
                        success: false,
                        error: `Error #${streamData.errors[0].code}: ${streamData.errors[0].detail}`,
                        text: (text += `: Error #${streamData.errors[0].code}: ${streamData.errors[0].detail}`)
                    };
                }
                else {
                    for (let u in streamData.items) {
                        if (streamData.items[u].videoType == "m3u8") {
                            options.tsDlPath = streamData.items[u].src;
                            break;
                        }
                    }
                }
                text = text.slice(0, -3);
                text += `${utils_1.randomNumber(60, 80)}%`;
                yield edit(message, text, Bobb);
                if (!options.tsDlPath) {
                    console.log("[ERROR] Unknown error\n");
                    return {
                        success: false,
                        error: "Unknown error",
                        text: (text += `: Unknown error`)
                    };
                }
                else {
                    if (options.enSub) {
                        let dL = yield module.exports.downloadStreams(Bobb, options, message, text);
                        if (dL) {
                            dL.tTime = Date.now() - start;
                            return { success: true, res: dL, text: dL.text };
                        }
                    }
                    else {
                        return {
                            success: true,
                            res: {
                                videoUrl: options.tsDlPath,
                                subsUrl: stDlPath,
                                tTime: Date.now() - start
                            },
                            text: text
                        };
                    }
                }
            }
        });
    },
    getSubsUrl(m) {
        for (let i in m) {
            let fpp = m[i].filePath.split(".");
            let fpe = fpp[fpp.length - 1];
            if (fpe == "vtt") {
                return m[i].filePath;
            }
        }
        return false;
    },
    downloadStreams(Bobb, options, message, text) {
        return __awaiter(this, void 0, void 0, function* () {
            let start = Date.now();
            let plQualityReq = yield helpers_1.getFuniData({
                url: options.tsDlPath
            });
            if (!plQualityReq.ok) {
                return {
                    success: false,
                    error: "Unable to get video data.",
                    text: (text += ": Unable to get video data.")
                };
            }
            let plQualityLinkList = m3u8(plQualityReq.res.body);
            let mainServersList = [
                "vmfst-api.prd.funimationsvc.com",
                "d132fumi6di1wa.cloudfront.net",
                "funiprod.akamaized.net"
            ];
            let ret = {};
            let plServerList = [], plStreams = {}, plLayersStr = [], plLayersRes = {}, plMaxLayer = 1;
            text = text.slice(0, -3);
            text += `${utils_1.randomNumber(81, 86)}%`;
            yield edit(message, text, Bobb);
            for (let s of plQualityLinkList.playlists) {
                console.log(s);
                let plLayerId = parseInt(s.uri.match(/_Layer(\d+)\.m3u8/)[1]);
                plMaxLayer = plMaxLayer < plLayerId ? plLayerId : plMaxLayer;
                let plUrlDl = s.uri;
                let plServer = new URL(plUrlDl).host;
                if (!plServerList.includes(plServer)) {
                    plServerList.push(plServer);
                }
                if (!Object.keys(plStreams).includes(plServer)) {
                    plStreams[plServer] = {};
                }
                if (plStreams[plServer][plLayerId] &&
                    plStreams[plServer][plLayerId] != plUrlDl) {
                    console.log(`[WARN] Non duplicate url for ${plServer} detected, please report to developer!`);
                }
                else {
                    plStreams[plServer][plLayerId] = plUrlDl;
                }
                let plResolution = `${s.attributes.RESOLUTION.height}p`;
                plLayersRes[plLayerId] = plResolution;
                let plBandwidth = Math.round(s.attributes.BANDWIDTH / 1024);
                if (plLayerId < 10) {
                    plLayerId = plLayerId.toString().padStart(2, " ");
                }
                let qualityStrAdd = `${plLayerId}: ${plResolution} (${plBandwidth}KiB/s)`;
                let qualityStrRegx = new RegExp(qualityStrAdd.replace(/(:|\(|\)|\/)/g, "\\$1"), "m");
                let qualityStrMatch = !plLayersStr.join("\r\n").match(qualityStrRegx);
                if (qualityStrMatch) {
                    plLayersStr.push(qualityStrAdd);
                }
            }
            for (let s of mainServersList) {
                if (plServerList.includes(s)) {
                    plServerList.splice(plServerList.indexOf(s), 1);
                    plServerList.unshift(s);
                    break;
                }
            }
            if (typeof options.quality == "object" && options.quality.length > 1) {
                options.quality = options.quality[options.quality.length - 1];
            }
            options.quality =
                options.quality < 1 || options.quality > plMaxLayer
                    ? plMaxLayer
                    : options.quality;
            let plSelectedServer = plServerList[options.server - 1];
            let plSelectedList = plStreams[plSelectedServer];
            let videoUrl = options.server < plServerList.length + 1 &&
                plSelectedList[options.quality]
                ? plSelectedList[options.quality]
                : "";
            plLayersStr.sort();
            if (videoUrl != "") {
                ret["videoUrl"] = videoUrl;
                ret["quality"] = plLayersRes[options.quality];
                options.force ? (ret["info"] = options.force) : options.force;
                fnSuffix = options.suffix.replace("SIZEp", plLayersRes[options.quality]);
                fnOutput = module.exports.cleanupFilename(`[${options.releaser}] ${fnTitle} - ${fnEpNum} [${fnSuffix}]`);
            }
            else if (options.server > plServerList.length) {
                return {
                    error: "Server not selected",
                    success: false,
                    text: (text += ": Server not selected")
                };
                console.log("[ERROR] Server not selected!\n");
            }
            else {
                return {
                    error: "Layer not selected!",
                    success: false,
                    text: (text += ": Layer not selected!")
                };
                console.log("[ERROR] Layer not selected!\n");
            }
            let dlFailed = false;
            if (!options.novids) {
                let reqVideo = yield helpers_1.getFuniData({
                    url: videoUrl
                });
                if (!reqVideo.ok) {
                    return;
                }
                let chunkList = m3u8(reqVideo.res.body);
                chunkList.baseUrl =
                    videoUrl
                        .split("/")
                        .slice(0, -1)
                        .join("/") + "/";
                let proxyHLS = false;
            }
            else {
                console.log("[INFO] Skip video downloading...\n");
            }
            let subsUrl = stDlPath;
            let subsExt = !options.mp4 || (options.mp4 && !options.mks && options.ass)
                ? ".ass"
                : ".srt";
            let addSubs = options.mks && subsUrl ? true : false;
            if (subsUrl) {
                ret["subsUrl"] = subsUrl;
            }
            if (dlFailed) {
                console.log("\n[INFO] TS file not fully downloaded, skip muxing video...\n");
                return ret;
            }
            if (options.skipmux) {
                return ret;
            }
            let muxTrg = path_1.default.join(__dirname, fnOutput);
            let tshTrg = path_1.default.join(__dirname, fnOutput);
            if (!fs_1.default.existsSync(`${muxTrg}.ts`) ||
                !fs_1.default.statSync(`${muxTrg}.ts`).isFile()) {
                text = text.slice(0, -3);
                text += `100%`;
                yield edit(message, text, Bobb);
                ret.text = text;
                return ret;
            }
        });
    },
    cleanupFilename(flnm) {
        const fixingChar = "_";
        const illegalRe = /[\/\?<>\\:\*\|":]/g;
        const controlRe = /[\x00-\x1f\x80-\x9f]/g;
        const reservedRe = /^\.+$/;
        const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
        const windowsTrailingRe = /[\. ]+$/;
        flnm = flnm
            .replace(illegalRe, fixingChar)
            .replace(controlRe, fixingChar)
            .replace(reservedRe, fixingChar)
            .replace(windowsReservedRe, fixingChar)
            .replace(windowsTrailingRe, fixingChar);
        return flnm;
    },
    searchShow(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let qs = { unique: true, limit: 50, q: options.query };
            let searchData = yield helpers_1.getFuniData({
                baseUrl: api_host,
                url: "/source/funimation/search/auto/",
                querystring: qs,
                token: token,
                useToken: true,
                useProxy: true
            });
            if (!searchData.ok) {
                return { success: false, error: `unable to search for ${qs}` };
            }
            searchData = helpers_1.parseJsonData(searchData.res.body);
            if (searchData.detail) {
                console.log(`[ERROR] ${searchData.detail}`);
                return { success: false, error: searchData.detail };
            }
            if (searchData.items && searchData.items.hits) {
                let shows = searchData.items.hits;
                return shows;
            }
            else {
                return { success: false, error: "None" };
            }
        });
    }
};
//# sourceMappingURL=funix.js.map