const parseGoLink = (url: RegExpExecArray | null): string | null => {
  if (!url?.[0]) return null;
  let lin: string = url[0];
  return lin.includes("streaming")
    ? lin.replace(/&/g, "&amp;") //.replace('streaming.php', 'download')
    : null;
};
import got, {Response} from "got";
import * as cheerio from "cheerio";
import * as utils from "../utils";
export default async function gogoScrap(gogoLink: string) {

  let streamSource: string;
  const goDef = /https?:\/\/(gogo-play|streamani)\.net/gm;
  const goStream = /\/\/streamani\.io\/streaming\.php\?([a-zA-Z-\/0-9_=;+%&])+/gm;
  const goSource = /https?:\/\/storage\.googleapis\.com\/([a-zA-Z-\/0-9_\.]+(\.mp4)+)/gm; //individual
  //const oldStreamServer = /\/\/streamani\.net\/loadserver\.php\?([a-zA-Z-\/0-9_=;+%&])+/g;  probs can be removed, this was the old stream server
  const newStreamServer = /\/\/streamani\.io\/embedplus\?([a-zA-Z-\/0-9_=;+%&])+/g
  const downloadPage = /https?:\/\/streamani\.io\/download\?([a-zA-Z-\/0-9_=;+%&])+/gm;

  const sourceReg = /(sources:\s?\[)({.*}),?]/gm;

  if (!goDef.exec(gogoLink)) throw new Error("Invalid Link");

  const firstHTML = (await got(gogoLink)).body;

  let toApi: string | null = parseGoLink(goStream.exec(firstHTML));

  if (toApi === null)
    throw new Error(
      "Could not get source. Check the link to see if it is correct."
    );
  toApi = `https:${toApi}`;

  const nextHTML = (await got(toApi)).body;

  const toServer: string | null = `https:${newStreamServer.exec(nextHTML)?.[0]}`;

  if (toServer === null) throw new Error("Could not get stream link");
  const serverHTML = (await got(toServer)).body;

  let $server = cheerio.load(serverHTML);
  const textNode = $server(".videocontent > script").text();
  if (textNode) {
    var scriptText = textNode
      .replace(/'/g, '"')
      .replace(/file:/g, '"file":')
      .replace(/label:/g, '"label":');
    var sourceEx = sourceReg.exec(scriptText);
    let link: any = sourceEx?.[2];
    if (!link) throw new Error("Could not get stream.");
    link = JSON.parse(link);
    streamSource = link.file;


    let src = (await got(link.file).catch((e: Error) => e.toString()));
    src = <string>(src as Response).body || <string>src;

    if (src.includes("Forbidden")) {
      let dlPage: any = downloadPage.exec(scriptText);
      dlPage = dlPage?.[0]
      if (dlPage) {
        dlPage = (await got(dlPage))?.body;
        streamSource = dlPage && goSource.exec(dlPage)
        if (streamSource) streamSource = streamSource?.[0]
      }
    }
    return { success: true, link: utils.encode64(streamSource) };
  } else throw new Error("Could not get source.");
}
