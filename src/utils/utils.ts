import CryptoJS from "crypto-js";
import axios from "axios";
import jwt from "jsonwebtoken";
import Discord, {Snowflake} from "discord.js";
import { webhook } from "../types/discord";
export function ordinate(i:number): string {
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
};
export async function createWebhook(opts: webhook): Promise<void> {
  if (!opts.embedContent) return;
  /*  opts = {
       type:"log",
       user:"asuna-kun",
       content:"",
       ...opts
    }*/
  let webhookClient = new Discord.WebhookClient(
    process.env.webhookURL! as Snowflake,
    process.env.webhookToken!
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
  return new Promise(function(resolve, reject) {
    jwt.verify(token, process.env.jwtAccessSecret!, function(err, decode) {
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
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
    c
  ) {
    var r = (d + Math.random() * 16) % 16 | 0;

    d = Math.floor(d / 16);

    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

  return uuid;
}

export const cmdReq = axios.create({
  baseURL: `https://discord.com/api/v8/applications/${process.env.appID}/guilds/${process.env.guildID}/commands`,
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bot ${process.env.botToken}`
  }
});
export function randomNumber(min: number, max: number): number {
  if (!min || !max) {
    // Default 0-100 if no args passed
    min = 0;
    max = 100;
  }
  return Math.floor(Math.random() * (max - min + 1) + min);
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
