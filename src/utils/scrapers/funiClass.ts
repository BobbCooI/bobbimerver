const funi = require("./funix.js");
import { ordinate } from "../utils";
import { funiOptions } from "./constants";
import Bobb from "../../bot/botClass";
import { ret } from "../../types/common";
export interface config {
  quality: number;
  server: number;
  suffix: string;
  releaser: string;
  novids: boolean;
  mp4: boolean;
  mks: boolean;
  enSub: boolean;
}
export default class Funimation {
  id: string;
  Bobb: Bobb;
  ops: any;
  config: config;
  searchRes: Array<string>;
  choiceID: string;
  choiceTitle: string;
  constructor(id: string, Bobb: Bobb, ops?: any) {
    this.config = { ...funiOptions, ...ops };
    this.id = id;
    this.Bobb = Bobb;
  }
  async login() {
    await funi.auth();
  }
  async search(query: string): Promise<ret> {
    if (!query) return { success: false, error: "Input a search title." };
    let findShow = await funi.searchShow({ query: query });
    if (findShow.success == false) {
      return {
        success: false,
        error: findShow.error
      };
    }
    let searchRet = findShow.map(
      (el: any, ind: number) => `${ordinate(ind + 1)} - ${el.title} … ${el.id}`
    );
    this.searchRes = searchRet;
    return { success: true, res: searchRet };
  }
  choose(choice: string): ret {
    choice = choice.toString();
    if (!this.searchRes)
      return { success: false, error: "Please search for an anime first." };
    let ind;
    if (choice.slice(-2).match(/st|nd|rd|th/g)) {
      ind = parseInt(choice.slice(0, -2))
        ? parseInt(choice.slice(0, -2))
        : false;
      if (
        !ind ||
        !this.searchRes[<number>ind - 1] ||
        !this.searchRes.find((i: string) => i.split(" - ")[0] === choice)
      )
        return {
          success: false,
          error: "Make sure the ordinal id input is correct!"
        };

      this.choiceID = this.searchRes[<number>ind - 1].split(" … ")[1];
      this.choiceTitle = this.searchRes[<number>ind - 1]
        .split(" … ")[0]
        .split(" - ")[1];
      return { success: true, res: this.choiceID };
    } else if (typeof parseInt(choice) === "number") {
      ind = parseInt(choice);
      if (!ind || !this.searchRes[ind - 1])
        return { success: false, error: "Make sure the  id input is correct!" };
      this.choiceID = this.searchRes[<number>ind - 1].split(" … ")[1];
      this.choiceTitle = this.searchRes[ind - 1]
        .split(" … ")[0]
        .split(" - ")[1];
      return { success: true, res: this.choiceID };
    }
    return { success: false, error: `Bad input. ${choice}` };
  }

  async getEp(ep: string, message: any): Promise<ret> {
    if (!ep || (!parseInt(ep) && ep !== "latest"))
      return {
        success: false,
        error:
          'Please provide an episode. Choices: "latest" or "1,2 or 1-2 or 1"'
      };
console.log(message)
    let m:any = message?.commandName
      ? message//await message.editReply(`beginning... ${randomNumber(1, 5)}%`)
      : await message.channel.send("Progress...");

    const getShow = await funi.getShow(
      this.Bobb,
      m,
      this.choiceID,
      ep,
      this.config
    );
    if (!getShow || !getShow.epMedia) {
      return {
        success: false,
        error: "There was an error fetching selected episode(s)"
      };
    }
    let errs = [];
    for (let ep in getShow.epMedia) {
      if (getShow.epMedia[ep].vData.success === false) {
        errs.push(`Episode ${ep}: ${getShow.epMedia[ep].vData.error}`);
        getShow.success = false;
      }
    }
    if (errs.length) return { success: false, error: errs.join("\n") };
    return { success: true, res: getShow, message: m };
  }
}
