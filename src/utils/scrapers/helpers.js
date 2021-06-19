import FormData from "form-data";
import got from "got";
export function formatTime(value)  {
  const totalSecondes = value
  // count
  let days = Math.floor(totalSecondes / 86400);
  let hours = Math.floor((totalSecondes % 86400) / 3600);
  let minutes = Math.floor(((totalSecondes % 86400) % 3600) / 60);
  let seconds = totalSecondes % 60;
  // strings
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
};
export function dateString (timestamp, noTimeStr) {
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
};
export function cleanupFilename (flnm) {
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
};
export function exec(pname, fpath, pargs, spc) {
  pargs = pargs ? " " + pargs : "";
  spc = Boolean(spc) ? "\n" : "";
  console.log(`\n> "${pname}"${pargs}${spc}`);
  require("child_process").execSync(fpath + pargs, { stdio: "inherit" });
};
export function makeCookie (data, keys)  {
  let res = [];
  for (let key of keys) {
    if (typeof data[key] !== "object") continue;
    res.push(`${key}=${data[key].value}`);
  }
  return res.join("; ");
};

export function cookieFile (data)  {
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
};
export function parseCookie(data){
  let res= {};
  for (let line of data) {
    let c = line.split("; ");
    let val= c.shift().split("=");
    res[val[0]] = {
      value: val.slice(1).join("=")
    };
    for (let f of c) {
      let param = f.split("=");
      if (param[0].toLowerCase() === "expires") {
        res[val[0]].expires = new Date(param[1]);
      } else if (param[1] === undefined) {
        res[val[0]][param[0]] = true;
      } else {
        res[val[0]][param[0]] = param[1];
      }
    }
  }
  return res;
};

export function checkCookieVal(chcookie) {
  return chcookie &&
    chcookie.toString() == "[object Object]" &&
    typeof chcookie.value == "string"
    ? true
    : false;
}
export function checkSessId(session_id){
  return session_id &&
    session_id.toString() == "[object Object]" &&
    typeof session_id.expires == "string" &&
    Date.now() < new Date(session_id.expires).getTime() &&
    typeof session_id.value == "string"
    ? true
    : false;
}
export function buildProxy(proxyBaseUrl, proxyAuth) {
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
  } else if (!proxyCfg.port && proxyCfg.protocol == "https:") {
    proxyStr += ":443";
  }

  return proxyStr;
}

/*xport async function getFuniData (options) {
  let gOptions = {
    url: options.url,
            responseType: "json",
    headers: {
      "User-Agent":"Mozilla/5.0 (Windows NT 10.0; WOW64; rv:70.0) Gecko/20100101 Firefox/70.0",
    Accept: "application/json, text/plain, * /*",
        "Content-Type": "application/json"
  },
    method: "GET"
  };
  if (options.baseUrl) {
    gOptions.prefixUrl = options.baseUrl;
    gOptions.url = gOptions.url.replace(/^\//, "");
  }
  if (options.querystring) {
    gOptions.url += `?${new URLSearchParams(options.querystring).toString()}`;
  }
  if (options.auth) {
    gOptions.method = "POST";
    gOptions.body = new FormData();
    gOptions.body.append("username", options.auth.user);
    gOptions.body.append("password", options.auth.pass);
  }
  if (options.useToken && options.token) {
    gOptions.headers.Authorization = `Token ${options.token}`;
  }
  
  // debug
  gOptions.hooks = {
    beforeRequest: [
      (gotOpts) => {
        if (options.debug) {
          console.log("[DEBUG] GOT OPTIONS:", gotOpts);
        }
      }
    ]
  };
  try {
         console.log(`[INFO] Getting data from ${gOptions.prefixUrl}/${gOptions.url}`);
    let res = await got(gOptions);

    if (typeof res.body == "string" && res.body.match(/^</)) {
      throw { name: "HTMLError", res };
    }
        //console.log("Res", res.body)
    return {
      ok: true,
      res
    };
  } catch (error) {
    console.log(gOptions, error);
    if (options.debug) {
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
      ok: false,
      error
    };
  }
};*/
export async function getFuniData (options) {
    let gOptions = { 
        url: options.url, 
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:70.0) Gecko/20100101 Firefox/70.0',
        }
    };
    if(options.baseUrl){
        gOptions.prefixUrl = options.baseUrl;
        gOptions.url = gOptions.url.replace(/^\//,'');
    }
    if(options.querystring){
        gOptions.url += `?${new URLSearchParams(options.querystring).toString()}`;
    }
    if(options.auth){
        gOptions.method = 'POST';
        gOptions.body = new FormData();
        gOptions.body.append('username', options.auth.user);
        gOptions.body.append('password', options.auth.pass);
    }
    if(options.useToken && options.token){
        gOptions.headers.Authorization = `Token ${options.token}`;
    }
    if(options.dinstid){
        gOptions.headers.devicetype = 'Android Phone';
    }
    // debug
    gOptions.hooks = {
        beforeRequest: [
            (gotOpts) => {
                if(options.debug){
                    console.log('[DEBUG] GOT OPTIONS:');
                }
            }
        ]
    };
    try {
 //     console.log(`[INFO] Getting data from ${gOptions.prefixUrl}/${gOptions.url}`);
        let res = await got(gOptions);
        if(res.body && res.body.match(/^</)){
            throw { name: 'HTMLError', res };
        }
        return {
            ok: true,
            res,
        };
    }
    catch(error){
      console.log(gOptions)
        if(options.debug){
            console.log(error);
        }
        if(error.response && error.response.statusCode && error.response.statusMessage){
            console.log(`[ERROR] ${error.name} ${error.response.statusCode}: ${error.response.statusMessage}`);
        }
        else if(error.name && error.name == 'HTMLError' && error.res && error.res.body){
            console.log(`[ERROR] ${error.name}:`);
            console.log(error.res.body);
        }
        else{
            console.log(`[ERROR] ${error.name}: ${error.code||error.message}`);
        }
        return {
            ok: false,
            error,
        };
    }
}
/*export {
  checkCookieVal,
  buildProxy,
  checkSessId,
  ordinate,
  formatTime,
  dateString,
  cleanupFilename,
  exec,
  makeCookie,
  cookieFile,
  parseCookie
};*/
export function parseJsonData(data) {
    if (!data) return {};
    if (typeof data === 'object') return data;
    if (typeof data === 'string') return JSON.parse(data);

    return {};
}