const parseGoLink = (url: RegExpExecArray|null): string | null =>{
  if(!url?.[0]) return null;
let lin: string = url[0];
  return lin.includes("streaming")
    ? lin.replace(/&/g, "&amp;") //.replace('streaming.php', 'download')
    : null;
}
import got from "got";
import * as cheerio from "cheerio";
import * as utils from "../utils";
export default async function gogoScrap(gogoLink:string)  {
    const goDef = /https?:\/\/gogo-play\.net/gm;
    const goStream = /\/\/streamani\.net\/streaming\.php\?([a-zA-Z-\/0-9_=;+%&])+/gm;
    //const goSource = /https?:\/\/storage\.googleapis\.com\/([a-zA-Z-\/0-9_\.]+(\.mp4)+)/gm; //individual
    const streamServer = /\/\/streamani\.net\/loadserver\.php\?([a-zA-Z-\/0-9_=;+%&])+/g;
    const sourceReg = /(sources:\s?\[)({.*}),?]/gm;
    
    if (!goDef.exec(gogoLink)) throw new Error("Invalid Link");
    const firstHTML = (await got(gogoLink)).body;
    let toApi:string|null= parseGoLink(goStream.exec(firstHTML))
    if (toApi === null )throw new Error("Could not get source. Check the link to see if it is correct.");
    toApi = `https:${toApi}`
    const nextHTML = (await got(toApi)).body;
    
   /* const toServer:string|null = streamServer.exec(nextHTML)
      ? `https:${
          /\/\/streamani\.net\/loadserver\.php\?([a-zA-Z-\/0-9_=;+%&])+/g.exec(
            nextHTML
          )[0]
        }`
      : null;*/
    const toServer:string|null=`https:${streamServer.exec(nextHTML)?.[0]}`;
    console.log(toServer);
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
      let link:any= sourceEx?.[2];
      if(!link) throw new Error("Could not get stream.");
        link = JSON.parse(link);
        return { success: true, link: utils.encode64(link.file) };
    } else throw new Error("Could not get source.");
    /* gSource.lastIndex = 0;
  let stream = goSource.exec(textNode);
  if(stream){
   stream = stream[0];
   return {
    success: true,link: utils.encode64(stream)
  }
}else throw 'Could not get stream.';
} else throw 'Could not get source.';*/
    // Specific for GoogleApi source only.

    /*		var $ = ch.load(nextHTML.body);
		let lowerQuals = [];
		$('a').each((i, e) => {
			if (e.attribs.download === '') {
				var li = e.children[0].data
					.slice(21)
					.replace('(', '')
					.replace(')', '')
					.replace(' - mp4', '');
					console.log(e.attribs.href)
				lowerQuals.push({
					source: utils.encode64(e.attribs.href),
					size: li == 'HDP' ? 'High Speed' : li
				});
			}
		});
		if (link) {
			return { main: utils.encode64(link[0]), other: lowerQuals.slice(1) };
		} else if(!link && lowerQuals ) {
		  return { main: lowerQuals[0].size === "High Speed"?lowerQuals[0].source: lowerQuals[lowerQuals.length - 1].source, other: lowerQuals}
		} else {
		throw 'Could not get stream.';
		}*/
};
