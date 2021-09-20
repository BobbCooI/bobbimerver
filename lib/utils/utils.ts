import CryptoJS from "crypto-js";
import axios from "axios";
import jwt from "jsonwebtoken";
import Discord from "discord.js";
import fs from 'fs';
import config from "../../src/config.json";
import { Command } from "../../lib/bot/Command";
import { Return } from "../../lib/bot/botTypes";
import _ from "lodash"
import { Swessage } from "../../lib/bot/discordExtensions";
export function ordinate(i: number): string {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

export type webhook = {
  type: string,
  user?: string,
  content?: string,
  embedContent: string
}
export async function createWebhook(opts: webhook): Promise<void> {
  if (!opts.embedContent) return;
  /*  opts = {
       type:"log",
       user:"asuna-kun",
       content:"",
       ...opts
    }*/
  let webhookClient = new Discord.WebhookClient(
    {
      url: config.webhookURL,
      token: config.webhookToken
    }
  );
  let date = Date()
    .toString()
    .split(" ")
    .slice(1, 5)
    .join(" ");

  const embed = new Discord.MessageEmbed()
    .setTitle(`[${opts.type}] | Date: ${date}`)
    .setDescription(opts.embedContent)
    .setColor("#0099ff");
  let toSend = {
    username: opts.user,
    avatarURL:
      "https://cdn.discordapp.com/avatars/800952633241501696/c6eb8c12d3623a6ca5575fdbb81892db.png",
    embeds: [embed],
    content: opts.content || ""
  };
  await webhookClient.send(toSend);
}
export function verify(token: string): Promise<boolean> {
  return new Promise(function (resolve, reject) {
    jwt.verify(token, process.env.jwtAccessSecret!, function (err, decode) {
      if (err) {
        reject(err);
        return;
      }

      resolve(!!decode);
    });
  });
}
export async function asyncForEach(
  array: [],
  callback: (item: any, ind: number, arr: []) => any
): Promise<void> {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
export function percentEncode(e: string) {
  return encodeURIComponent(e)
    .replace(/\!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/\'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}
export function randomNonce(length: number) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
export function encode64(str: string): string {
  const a = CryptoJS.enc.Utf8.parse(str);
  const encoded = CryptoJS.enc.Base64.stringify(a);
  return encoded;
}

export function decode64(str: string): string {
  const encodedWord = CryptoJS.enc.Base64.parse(str);
  const decoded = CryptoJS.enc.Utf8.stringify(encodedWord);
  return decoded;
}

export function generateUUID(): string {
  var d = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
    c
  ) {
    var r = (d + Math.random() * 16) % 16 | 0;

    d = Math.floor(d / 16);

    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

  return uuid;
}
export function chunkSubstr(str: string, size: number): Array<string> {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
}
export function moveImg(img: string, fileTo: string): void {
  var data = img.replace(/^data:image\/\w+;base64,/, "");
  var buf = Buffer.from(data, "base64");
  fs.writeFileSync(fileTo, buf);
}
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
export const cmdReq = axios.create({
  baseURL: `https://discord.com/api/v8/applications/${process.env.appID}/guilds/${process.env.guildID}/commands`,
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bot ${process.env.botToken}`
  }
});
export function randomNumber(min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
export function randomColor(): number {
  return Math.floor(Math.random() * 0xffffff);
}
export function timeMilli(millis: number): string {
  var minutes = Math.floor(millis / 60000);
  var seconds = (millis % 60000) / 1000;
  return (
    minutes.toString() +
    ":" +
    (seconds < 10 ? "0" : "") +
    seconds.toFixed(2).toString()
  );
}
export function makeID(length: number): string {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
export function unembedify(embed: Discord.MessageEmbed, content?: string) {
  let embedString = "";
  if (embed.author) embedString += `**${embed.author.name}**\n`;
  if (embed.title) embedString += `**${embed.title}**\n`;
  if (embed.description) embedString += `${embed.description}\n`;
  for (const field of embed.fields || []) {
    embedString += `\n**${field.name}**\n${field.value}\n`;
  }
  if (embed.footer) embedString += `\n${embed.footer.text}`;
  return `${content || ""}\n${embedString || "Empty embed"}`; // Returns a string
}

export function constructHelp(command: Command) {
  let embed = new Discord.MessageEmbed()
  embed.setTitle(`**${command.props.name}**`)
  embed.setDescription(`${command.props.description}`)
  embed.setTimestamp()
  embed.addField("> Aliases", command.aliases.join(", "), false)
  embed.addField("> Usage", `c!${command.props.name}`, false)
  return embed
}
export function slugify(str: string): string {
  const a =
    "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
  const b =
    "aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------";
  const p = new RegExp(a.split("").join("|"), "g");

  return str
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, ""); // Trim - from start of text
  //   .replace(/-+$/, '') // Trim - from end of text
}

export function formatNumber(num: number): string {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
export function parseNum(thing: number | string): number | null {
  if (typeof thing === "number") return thing;
  let ret;
  if (
    (thing.includes("k") && thing.includes("e")) ||
    (thing.includes("k") && thing.includes(",")) ||
    (thing.includes("e") && thing.includes(","))
  )
    return null;
  if (thing.includes("k")) {
    let ind = thing.indexOf("e");
    ret = `${thing.slice(0, ind)}000`;
  } else if (thing.includes("e")) {
    let ind = thing.indexOf("e");
    let numAfterZero = thing.slice(ind + 1);
    let amtOfZeros = "0".repeat(parseInt(numAfterZero));
    ret = `${thing.slice(0, ind)}${amtOfZeros}`;
  } else if (thing.includes(",")) {
    ret = thing.replace(/,/g, "");
  } else {
    return null;
  }

  return parseInt(ret);
}
export function parseTime(s: number): string {
  // Pad to 2 or 3 digits, default is 2
  function pad(n: number, z?: number) {
    z = z || 2;
    return ("00" + n).slice(-z);
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return `${pad(hrs)} Hours : ${pad(mins)} Minutes : ${pad(secs)}.${pad(
    ms,
    3
  )} Seconds`;
}

export function handleRes(res: any, command: Command, commandType: string, message: Swessage) {
  if (!res) {
    return;
  }
  if (res instanceof Return) {
    if (res.Paginate) return;

    if (_.isEmpty(res)) throw new Error(`No content to send back for ${commandType}: ${command.props.name} ?`)
    res = res.resolvedMessageOpts();
  } else if (typeof res == "string") {
    res = { content: res }
  } else {
    throw new Error(`What kind of return for ${command.props.name}? I received ${res} type ${typeof res}`)
  }
  return message.send(res).catch(console.log)
}