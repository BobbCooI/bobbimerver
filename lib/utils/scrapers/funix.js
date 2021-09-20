import config from "../../../src/config.json"

const api_host = config.funiApiHost;
const token = config.funiToken;
const m3u8 = require("m3u8-parsed");
//const vttConvert = require("../vtt.js");
import fs from "fs";
import path from "path";
import { randomNumber } from "../utils";
import { getFuniData, parseJsonData } from "./helpers";
let fnTitle = "",
  fnEpNum = "",
  fnSuffix = "",
  fnOutput = "",
  tsDlPath = false,
  stDlPath = false,
  batchDL = false;
async function edit(which, content, Bobb) {
  if (which) {
    if (which?.commandName) {
      await which.editReply(content);
    } else {
      await which.edit(content);
    }
  }
}
module.exports = {
  async auth() {
    let authOpts = {};
    authOpts.user = config.funiEmail;
    authOpts.pass = config.funiPass;
    let authData = await getFuniData({
      baseUrl: api_host,
      url: "/auth/login/",
      useProxy: true,
      auth: authOpts
    });
    if (authData.ok) {
      authData = parseJsonData(authData.res.body);
      if (authData.token) {
        console.log(
          "[INFO] Authentication success, your token: %s\n",
          authData.token
        );
        //    fs.writeFileSync(tokenFile + '.yml', yaml.stringify({'token': authData.token}));
      } else if (authData.error) {
        console.log("[ERROR]%s\n", authData.error);
        process.exit(1);
      }
    }
  },
  async getShow(Bobb, titleId, get = "latest", message, options) {
    let start = Date.now();
    // show main data
    let text = `beginning... ${randomNumber(5, 10)}%`;
    await edit(message, text, Bobb);

    let ret = { epMedia: {} };
    let showData = await getFuniData({
      baseUrl: api_host,
      url: `/source/catalog/title/${parseInt(titleId, 10)}`,
      token: token,
      useToken: true,
      useProxy: true
    });
    // check errors
    if (!showData.ok) {
      return { success: false, error: "could not catalog title id" };
    }
    showData = parseJsonData(showData.res.body);
    if (showData.status) {
      let err = `[ERROR] Error #${showData.status}: ${showData.data.errors[0].detail}\n`;
      console.log(err);
      ret.error = err;
      ret.success = false;
      return ret;
    } else if (!showData.items || showData.items.length < 1) {
      console.log("[ERROR] Show not found\n");
      ret.error = "Show not found!";
      ret.success = false;
      return ret;
    }
    showData = showData.items[0];
    ret.poster = showData.poster;
    /*  console.log(
      "[#%s] %s (%s)",
      showData.id,          SHOW DATA
      showData.title,
      showData.releaseYear
    );*/
    // show episodes
    text = `got show... ${randomNumber(15, 26)}%`;
    await edit(message, text, Bobb);
    let qs = {
      limit: get == "latest" ? 1 : -1,
      sort: "order",
      sort_direction: get == "latest" ? "DESC" : "ASC",
      title_id: parseInt(titleId, 10)
    };
    qs.language = "English";
    let episodesData = await getFuniData({
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
    let eps = parseJsonData(episodesData.res.body).items,
      is_selected = false;
    get =
      get == "latest"
        ? ["latest"]
        : get.toString().match(",")
          ? get.toString().split(",")
          : [get.toString()];
    let epSelList = get,
      epSelRanges = [],
      fnSlug = [],
      epSelEps = [];
    text = `parsing.. ${randomNumber(27, 40)}%`;
    await edit(message, text, Bobb);
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
          } else {
            return letter + e[0];
          }
        } else {
          return "";
        }
      } else if (e.match(/^(?:[A-Z]|)\d+$/i)) {
        return e.replace(/^(?:([A-Z])|)(0+)/i, "$1").toUpperCase();
      } else {
        return "";
      }
    });
    epSelList = [...new Set(epSelList.concat(epSelRanges))];
    // parse episodes list
    for (let e in eps) {
      let showStrId = eps[e].ids.externalShowId;
      let epStrId = eps[e].ids.externalEpisodeId.replace(
        new RegExp("^" + showStrId),
        ""
      );
      // select
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
        ret.epMedia = {
          ...ret.epMedia,
          ...data
        };
        epSelEps.push(epStrId);
        is_selected = true;
      } else if (get == "latest") {
        ret.epMedia = {
          ...ret.epMedia,
          ...data
        };
        fnSlug.push(data);
        epSelEps.push(get);
        is_selected = true;
      } else {
        is_selected = false;
      }
      // console vars
      let tx_snum =
        eps[e].item.seasonNum == 1 ? "" : ` S${eps[e].item.seasonNum}`;
      let tx_type =
        eps[e].mediaCategory != "episode" ? eps[e].mediaCategory : "";
      let tx_enum =
        eps[e].item.episodeNum !== ""
          ? `#${(eps[e].item.episodeNum < 10 ? "0" : "") +
          eps[e].item.episodeNum}`
          : "#" + eps[e].item.episodeId;
      let qua_str = eps[e].quality.height
        ? eps[e].quality.quality + eps[e].quality.height
        : "UNK";
      let aud_str =
        eps[e].audio.length > 0 ? `, ${eps[e].audio.join(", ")}` : "";
      let rtm_str = eps[e].item.runtime !== "" ? eps[e].item.runtime : "??:??";
      // console string
      let episodeIdStr = epStrId;
      let conOut = `[${episodeIdStr}] `;
      conOut += `${eps[e].item.titleName + tx_snum} - ${tx_type + tx_enum} ${eps[e].item.episodeName
        } `;
      conOut += `(${rtm_str}) [${qua_str + aud_str}]`;
      conOut += is_selected ? " (selected)" : "";
      conOut += eps.length - 1 == e ? "\n" : "";
      //     console.log(conOut);
    }
    if (fnSlug.length > 1) {
      batchDL = true;
    }
    if (fnSlug.length < 1) {
      console.log("[INFO] Episodes not selected or found!\n");
      ret.error = "Episodes not selected or found!";
      ret.success = false;
      return ret;
    } else {
      text = `getting eps.. ${randomNumber(45, 60)}%`;
      await edit(message, text, Bobb);
      //   console.log("[INFO] Selected Episodes: %s\n", epSelEps.join(", "));
      let appT = text;
      for (let ep in ret.epMedia) {
        let vData = await module.exports.getEpisode(
          Bobb,
          {
            titleSlug: ret.epMedia[ep].titleSlug,
            episodeSlug: ret.epMedia[ep].episodeSlug
          },
          options,
          message,
          appT
        );
        ret.epMedia[ep].tTime = Date.now() - start;
        ret.epMedia[ep].vData = vData;
        appT = vData.text;
      }
    }
    return ret;
  },

  async getEpisode(Bobb, data, options, message, text) {
    let start = Date.now();
    let episodeData = await getFuniData({
      baseUrl: api_host,
      url: `/source/catalog/episode/${data.titleSlug}/${data.episodeSlug}/`,
      token: token,
      useToken: true,
      useProxy: true
    });
    text += `\n${data.episodeSlug} - ${randomNumber(1, 10)}%`;
    await edit(message, text, Bobb);
    if (!episodeData.ok) {
      return {
        success: false,
        error: "Unable to get video",
        text: (text += ": Unable to get video")
      };
    }
    let ep = parseJsonData(episodeData.res.body).items[0],
      streamId = 0;
    // build fn
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

    // is uncut
    let uncut = {
      Japanese: false,
      English: false
    };

    // end
    console.log(
      "[INFO] %s - S%sE%s - %s",
      ep.parent.title,
      ep.parent.seasonNumber ? ep.parent.seasonNumber : "?",
      ep.number ? ep.number : "?",
      ep.title
    );

    // console.log("[INFO] Available streams (Non-Encrypted):");

    // map medias
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
      } else {
        return { id: 0, type: "" };
      }
    });
    text = text.slice(0, -3);
    text += `${randomNumber(15, 40)}%`;
    await edit(message, text, Bobb);
    // select
    media = media.reverse();
    for (let m of media) {
      let selected = false;
      let force;
      if (m.id > 0 && m.type == "Non-Encrypted") {
        let dub_type = m.language;
        /*        let selUncut = !argv.simul && uncut[dub_type] && m.version.match(/uncut/i) 
                ? true 
                : (!uncut[dub_type] || argv.simul && m.version.match(/simulcast/i) ? true : false);*/
        if (dub_type == "Japanese" && options.enSub) {
          streamId = m.id;
          stDlPath = m.subtitles;
          selected = true;
        } else if (dub_type == "English" && !options.enSub) {
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
        /*      console.log(
          `[#${m.id}] ${dub_type} [${m.version}]`,   subtitle selection
          selected ? "(selected)" : "" 
        );*/
      }
    }

    if (streamId < 1) {
      console.log("[ERROR] Track not selected\n");
      return {
        success: false,
        error: "Track not selected or there are no hard english subs",
        text: (text += ": Track not selected or there are no hard english subs")
      };
    } else {
      let streamData = await getFuniData({
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
      streamData = parseJsonData(streamData.res.body);
      options.tsDlPath = false;
      if (streamData.errors) {
        console.log(
          "[ERROR] Error #%s: %s\n",
          streamData.errors[0].code,
          streamData.errors[0].detail
        );
        return {
          success: false,
          error: `Error #${streamData.errors[0].code}: ${streamData.errors[0].detail}`,
          text: (text += `: Error #${streamData.errors[0].code}: ${streamData.errors[0].detail}`)
        };
      } else {
        for (let u in streamData.items) {
          if (streamData.items[u].videoType == "m3u8") {
            options.tsDlPath = streamData.items[u].src;
            break;
          }
        }
      }
      text = text.slice(0, -3);
      text += `${randomNumber(60, 80)}%`;
      await edit(message, text, Bobb);
      if (!options.tsDlPath) {
        console.log("[ERROR] Unknown error\n");
        return {
          success: false,
          error: "Unknown error",
          text: (text += `: Unknown error`)
        };
      } else {
        if (options.enSub) {
          let dL = await module.exports.downloadStreams(
            Bobb,
            options,
            message,
            text
          );
          if (dL) {
            dL.tTime = Date.now() - start;
            return { success: true, res: dL, text: dL.text };
          }
        } else {
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
  },

  getSubsUrl(m) {
    for (let i in m) {
      let fpp = m[i].filePath.split(".");
      let fpe = fpp[fpp.length - 1];
      if (fpe == "vtt") {
        // dfxp (TTML), srt, vtt
        return m[i].filePath;
      }
    }
    return false;
  },
  async downloadStreams(Bobb, options, message, text) {
    // req playlist
    let start = Date.now();
    let plQualityReq = await getFuniData({
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

    let plServerList = [],
      plStreams = {},
      plLayersStr = [],
      plLayersRes = {},
      plMaxLayer = 1;
    text = text.slice(0, -3);
    text += `${randomNumber(81, 86)}%`;
    await edit(message, text, Bobb);
    for (let s of plQualityLinkList.playlists) {
      // set layer and max layer
      console.log(s);
      let plLayerId = parseInt(s.uri.match(/_Layer(\d+)\.m3u8/)[1]);
      plMaxLayer = plMaxLayer < plLayerId ? plLayerId : plMaxLayer;
      // set urls and servers
      let plUrlDl = s.uri;
      let plServer = new URL(plUrlDl).host;
      if (!plServerList.includes(plServer)) {
        plServerList.push(plServer);
      }
      if (!Object.keys(plStreams).includes(plServer)) {
        plStreams[plServer] = {};
      }
      if (
        plStreams[plServer][plLayerId] &&
        plStreams[plServer][plLayerId] != plUrlDl
      ) {
        console.log(
          `[WARN] Non duplicate url for ${plServer} detected, please report to developer!`
        );
      } else {
        plStreams[plServer][plLayerId] = plUrlDl;
      }
      // set plLayersStr
      let plResolution = `${s.attributes.RESOLUTION.height}p`;
      plLayersRes[plLayerId] = plResolution;
      let plBandwidth = Math.round(s.attributes.BANDWIDTH / 1024);
      if (plLayerId < 10) {
        plLayerId = plLayerId.toString().padStart(2, " ");
      }
      let qualityStrAdd = `${plLayerId}: ${plResolution} (${plBandwidth}KiB/s)`;
      let qualityStrRegx = new RegExp(
        qualityStrAdd.replace(/(:|\(|\)|\/)/g, "\\$1"),
        "m"
      );
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
    let videoUrl =
      options.server < plServerList.length + 1 &&
        plSelectedList[options.quality]
        ? plSelectedList[options.quality]
        : "";
    plLayersStr.sort();
    //  console.log(`[INFO] Servers available:\n\t${plServerList.join("\n\t")}`);
    // console.log(`[INFO] Available qualities:\n\t${plLayersStr.join("\n\t")}`);

    if (videoUrl != "") {
      /*    console.log(
        `[INFO] Selected layer: ${options.quality} (${
          plLayersRes[options.quality]
        }) @ ${plSelectedServer}`
      );
      console.log("[INFO] Stream URL:", videoUrl);*/
      ret["videoUrl"] = videoUrl;
      ret["quality"] = plLayersRes[options.quality];
      options.force ? (ret["info"] = options.force) : options.force;
      fnSuffix = options.suffix.replace("SIZEp", plLayersRes[options.quality]);
      fnOutput = module.exports.cleanupFilename(
        `[${options.releaser}] ${fnTitle} - ${fnEpNum} [${fnSuffix}]`
      );
      //    console.log(`[INFO] Output filename: ${fnOutput}.ts`);
    } else if (options.server > plServerList.length) {
      return {
        error: "Server not selected",
        success: false,
        text: (text += ": Server not selected")
      };
      console.log("[ERROR] Server not selected!\n");
    } else {
      return {
        error: "Layer not selected!",
        success: false,
        text: (text += ": Layer not selected!")
      };
      console.log("[ERROR] Layer not selected!\n");
    }

    let dlFailed = false;

    if (!options.novids) {
      // download video
      let reqVideo = await getFuniData({
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

      //used to be code here
    } else {
      console.log("[INFO] Skip video downloading...\n");
    }

    // add subs
    let subsUrl = stDlPath;
    let subsExt =
      !options.mp4 || (options.mp4 && !options.mks && options.ass)
        ? ".ass"
        : ".srt";
    let addSubs = options.mks && subsUrl ? true : false;
    // download subtitles
    if (subsUrl) {
      //   console.log("[INFO] Downloading subtitles...");
      ret["subsUrl"] = subsUrl;
      /*  let subsSrc = await getFuniData({
        url: subsUrl,
        useProxy: true
      });
      if (subsSrc.ok) {
        let assData = vttConvert(
          subsSrc.res.body,
          subsExt == ".srt" ? true : false
        );
        ret["assSubs"] = assData;
        let assFile = path.join(__dirname, fnOutput) + subsExt;
        let file = fs.writeFileSync(assFile, assData);
        console.log("[INFO] Subtitles downloaded at %s!", assFile);
      } else {
        console.log("[ERROR] Failed to download subtitles!");
        addSubs = false;
      }*/
    }

    if (dlFailed) {
      console.log(
        "\n[INFO] TS file not fully downloaded, skip muxing video...\n"
      );
      return ret;
    }

    if (options.skipmux) {
      return ret;
    }

    let muxTrg = path.join(__dirname, fnOutput);
    let tshTrg = path.join(__dirname, fnOutput);

    if (
      !fs.existsSync(`${muxTrg}.ts`) ||
      !fs.statSync(`${muxTrg}.ts`).isFile()
    ) {
      //   console.log("\n[INFO] TS file not found, skip muxing video...\n");
      text = text.slice(0, -3);
      text += `100%`;
      await edit(message, text, Bobb);
      ret.text = text
      return ret;
    }

    // usage
    /*   let usableMKVmerge = true;
    let usableFFmpeg = true;
    
    // check exec path
    let mkvmergebinfile = await lookpath(path.join(cfg.bin.mkvmerge));
    let ffmpegbinfile   = await lookpath(path.join(cfg.bin.ffmpeg));
    
    // check exec
    if( !argv.mp4 && !mkvmergebinfile ){
        console.log('[WARN] MKVMerge not found, skip using this...');
        usableMKVmerge = false;
    }
    if( !usableMKVmerge && !ffmpegbinfile || argv.mp4 && !ffmpegbinfile ){
        console.log('[WARN] FFmpeg not found, skip using this...');
        usableFFmpeg = false;
    }
    
    // ftag
    argv.ftag = argv.ftag ? argv.ftag : argv.a;
    argv.ftag = shlp.cleanupFilename(argv.ftag);
    
    // select muxer
    if(!argv.mp4 && usableMKVmerge){
        // mux to mkv
        let mkvmux  = [];
        mkvmux.push('-o',`${muxTrg}.mkv`);
        mkvmux.push('--no-date','--disable-track-statistics-tags','--engage','no_variable_data');
        mkvmux.push('--track-name',`0:[${argv.ftag}]`);
        mkvmux.push('--language',`1:${argv.sub?'jpn':'eng'}`);
        mkvmux.push('--video-tracks','0','--audio-tracks','1');
        mkvmux.push('--no-subtitles','--no-attachments');
        mkvmux.push(`${muxTrg}.ts`);
        if(addSubs){
            mkvmux.push('--language','0:eng');
            mkvmux.push(`${muxTrg}${subsExt}`);
        }
        fs.writeFileSync(`${muxTrg}.json`,JSON.stringify(mkvmux,null,'  '));
        shlp.exec('mkvmerge',`"${mkvmergebinfile}"`,`@"${muxTrg}.json"`);
        fs.unlinkSync(`${muxTrg}.json`);
    }
    else if(usableFFmpeg){
        let ffext = !argv.mp4 ? 'mkv' : 'mp4';
        let ffmux = `-i "${muxTrg}.ts" `;
        ffmux += addSubs ? `-i "${muxTrg}${subsExt}" ` : '';
        ffmux += '-map 0 -c:v copy -c:a copy ';
        ffmux += addSubs ? '-map 1 ' : '';
        ffmux += addSubs && !argv.mp4 ? '-c:s ass ' : '';
        ffmux += addSubs &&  argv.mp4 ? '-c:s mov_text ' : '';
        ffmux += '-metadata encoding_tool="no_variable_data" ';
        ffmux += `-metadata:s:v:0 title="[${argv.a}]" -metadata:s:a:0 language=${argv.sub?'jpn':'eng'} `;
        ffmux += addSubs ? '-metadata:s:s:0 language=eng ' : '';
        ffmux += `"${muxTrg}.${ffext}"`;
        // mux to mkv
        shlp.exec('ffmpeg',`"${ffmpegbinfile}"`,ffmux);
    }
    else{
        console.log('\n[INFO] Done!\n');
        return;
    }
    if(argv.notrashfolder && argv.nocleanup){
        // don't move or delete temp files
    }
    else if(argv.nocleanup){
        fs.renameSync(muxTrg+'.ts', tshTrg + '.ts');
        if(subsUrl && addSubs){
            fs.renameSync(muxTrg +subsExt, tshTrg +subsExt);
        }
    }
    else{
        fs.unlinkSync(muxTrg+'.ts');
        if(subsUrl && addSubs){
            fs.unlinkSync(muxTrg +subsExt);
        }
    }
    console.log('\n[INFO] Done!\n');*/
  },
  cleanupFilename(flnm) {
    const fixingChar = "_";
    const illegalRe = /[\/\?<>\\:\*\|":]/g; // Illegal Characters on conscious Operating Systems: / ? < > \ : * | "
    const controlRe = /[\x00-\x1f\x80-\x9f]/g; // Unicode Control codes: C0 0x00-0x1f & C1 (0x80-0x9f)
    const reservedRe = /^\.+$/; // Reserved filenames on Unix-based systems (".", "..")
    const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
    /*    Reserved filenames in Windows ("CON", "PRN", "AUX", "NUL", "COM1",
        "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
        "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", and
        "LPT9") case-insensitively and with or without filename extensions. */
    const windowsTrailingRe = /[\. ]+$/;
    flnm = flnm
      .replace(illegalRe, fixingChar)
      .replace(controlRe, fixingChar)
      .replace(reservedRe, fixingChar)
      .replace(windowsReservedRe, fixingChar)
      .replace(windowsTrailingRe, fixingChar);
    return flnm;
  },
  async searchShow(options) {
    let qs = { unique: true, limit: 50, q: options.query };
    let searchData = await getFuniData({
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

    searchData = parseJsonData(searchData.res.body);

    if (searchData.detail) {
      console.log(`[ERROR] ${searchData.detail}`);
      return { success: false, error: searchData.detail };
    }
    if (searchData.items && searchData.items.hits) {
      let shows = searchData.items.hits;

      return shows;
    } else {
      return { success: false, error: "None" };
    }
  }
};
