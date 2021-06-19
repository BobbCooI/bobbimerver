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
exports.parseJsonData = exports.getFuniData = exports.buildProxy = exports.checkSessId = exports.checkCookieVal = exports.parseCookie = exports.cookieFile = exports.makeCookie = exports.exec = exports.cleanupFilename = exports.dateString = exports.formatTime = void 0;
const form_data_1 = __importDefault(require("form-data"));
const got_1 = __importDefault(require("got"));
function formatTime(value) {
    const totalSecondes = value;
    let days = Math.floor(totalSecondes / 86400);
    let hours = Math.floor((totalSecondes % 86400) / 3600);
    let minutes = Math.floor(((totalSecondes % 86400) % 3600) / 60);
    let seconds = totalSecondes % 60;
    days = days > 0 ? days + "d" : "";
    hours = Boolean(days || hours)
        ? days + ((Boolean(days) && hours < 10 ? "0" : "") + hours + "h")
        : "";
    minutes = Boolean(minutes || hours)
        ? hours + ((Boolean(hours) && minutes < 10 ? "0" : "") + minutes + "m")
        : "";
    seconds =
        minutes + (Boolean(minutes) && seconds < 10 ? "0" : "") + seconds + "s";
    return seconds;
}
exports.formatTime = formatTime;
;
function dateString(timestamp, noTimeStr) {
    let timeStr = "";
    noTimeStr = Boolean(noTimeStr);
    if (!timestamp) {
        timeStr = noTimeStr ? "" : " 00:00:00";
        return `0000-00-00${timeStr} UTC`;
    }
    const date = new Date(timestamp).toISOString();
    const dateStr = date.substring(0, date.indexOf("T"));
    if (!noTimeStr) {
        timeStr = " " + date.substring(date.indexOf("T") + 1, date.indexOf("."));
    }
    return `${dateStr}${timeStr} UTC`;
}
exports.dateString = dateString;
;
function cleanupFilename(flnm) {
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
}
exports.cleanupFilename = cleanupFilename;
;
function exec(pname, fpath, pargs, spc) {
    pargs = pargs ? " " + pargs : "";
    spc = Boolean(spc) ? "\n" : "";
    console.log(`\n> "${pname}"${pargs}${spc}`);
    require("child_process").execSync(fpath + pargs, { stdio: "inherit" });
}
exports.exec = exec;
;
function makeCookie(data, keys) {
    let res = [];
    for (let key of keys) {
        if (typeof data[key] !== "object")
            continue;
        res.push(`${key}=${data[key].value}`);
    }
    return res.join("; ");
}
exports.makeCookie = makeCookie;
;
function cookieFile(data) {
    let res = {};
    data = data.replace(/\r/g, "").split("\n");
    for (let line of data) {
        let c = line.split("\t");
        if (c.length < 7) {
            continue;
        }
        res[c[5]] = {};
        res[c[5]].value = c[6];
        res[c[5]].expires = new Date(parseInt(c[4]) * 1000);
        res[c[5]].path = c[2];
        res[c[5]].domain = c[0].replace(/^\./, "");
        res[c[5]].secure = c[3] == "TRUE" ? true : false;
    }
    return res;
}
exports.cookieFile = cookieFile;
;
function parseCookie(data) {
    let res = {};
    for (let line of data) {
        let c = line.split("; ");
        let val = c.shift().split("=");
        res[val[0]] = {
            value: val.slice(1).join("=")
        };
        for (let f of c) {
            let param = f.split("=");
            if (param[0].toLowerCase() === "expires") {
                res[val[0]].expires = new Date(param[1]);
            }
            else if (param[1] === undefined) {
                res[val[0]][param[0]] = true;
            }
            else {
                res[val[0]][param[0]] = param[1];
            }
        }
    }
    return res;
}
exports.parseCookie = parseCookie;
;
function checkCookieVal(chcookie) {
    return chcookie &&
        chcookie.toString() == "[object Object]" &&
        typeof chcookie.value == "string"
        ? true
        : false;
}
exports.checkCookieVal = checkCookieVal;
function checkSessId(session_id) {
    return session_id &&
        session_id.toString() == "[object Object]" &&
        typeof session_id.expires == "string" &&
        Date.now() < new Date(session_id.expires).getTime() &&
        typeof session_id.value == "string"
        ? true
        : false;
}
exports.checkSessId = checkSessId;
function buildProxy(proxyBaseUrl, proxyAuth) {
    if (!proxyBaseUrl.match(/^(https?|socks4|socks5):/)) {
        proxyBaseUrl = "http://" + proxyBaseUrl;
    }
    let proxyCfg = new URL(proxyBaseUrl);
    let proxyStr = `${proxyCfg.protocol}//`;
    if (typeof proxyCfg.hostname != "string" || proxyCfg.hostname == "") {
        throw new Error("[ERROR] Hostname and port required for proxy!");
    }
    if (proxyAuth && typeof proxyAuth == "string" && proxyAuth.match(":")) {
        proxyCfg.username = proxyAuth.split(":")[0];
        proxyCfg.password = proxyAuth.split(":")[1];
        proxyStr += `${proxyCfg.username}:${proxyCfg.password}@`;
    }
    proxyStr += proxyCfg.hostname;
    if (!proxyCfg.port && proxyCfg.protocol == "http:") {
        proxyStr += ":80";
    }
    else if (!proxyCfg.port && proxyCfg.protocol == "https:") {
        proxyStr += ":443";
    }
    return proxyStr;
}
exports.buildProxy = buildProxy;
function getFuniData(options) {
    return __awaiter(this, void 0, void 0, function* () {
        let gOptions = {
            url: options.url,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:70.0) Gecko/20100101 Firefox/70.0',
            }
        };
        if (options.baseUrl) {
            gOptions.prefixUrl = options.baseUrl;
            gOptions.url = gOptions.url.replace(/^\//, '');
        }
        if (options.querystring) {
            gOptions.url += `?${new URLSearchParams(options.querystring).toString()}`;
        }
        if (options.auth) {
            gOptions.method = 'POST';
            gOptions.body = new form_data_1.default();
            gOptions.body.append('username', options.auth.user);
            gOptions.body.append('password', options.auth.pass);
        }
        if (options.useToken && options.token) {
            gOptions.headers.Authorization = `Token ${options.token}`;
        }
        if (options.dinstid) {
            gOptions.headers.devicetype = 'Android Phone';
        }
        gOptions.hooks = {
            beforeRequest: [
                (gotOpts) => {
                    if (options.debug) {
                        console.log('[DEBUG] GOT OPTIONS:');
                    }
                }
            ]
        };
        try {
            let res = yield got_1.default(gOptions);
            if (res.body && res.body.match(/^</)) {
                throw { name: 'HTMLError', res };
            }
            return {
                ok: true,
                res,
            };
        }
        catch (error) {
            console.log(gOptions);
            if (options.debug) {
                console.log(error);
            }
            if (error.response && error.response.statusCode && error.response.statusMessage) {
                console.log(`[ERROR] ${error.name} ${error.response.statusCode}: ${error.response.statusMessage}`);
            }
            else if (error.name && error.name == 'HTMLError' && error.res && error.res.body) {
                console.log(`[ERROR] ${error.name}:`);
                console.log(error.res.body);
            }
            else {
                console.log(`[ERROR] ${error.name}: ${error.code || error.message}`);
            }
            return {
                ok: false,
                error,
            };
        }
    });
}
exports.getFuniData = getFuniData;
function parseJsonData(data) {
    if (!data)
        return {};
    if (typeof data === 'object')
        return data;
    if (typeof data === 'string')
        return JSON.parse(data);
    return {};
}
exports.parseJsonData = parseJsonData;
//# sourceMappingURL=helpers.js.map