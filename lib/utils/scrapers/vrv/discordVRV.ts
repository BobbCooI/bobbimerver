import Bobb from "@src/bot/botClass";
import VRV from "./VRV";
import { cache, VRVret, searchItem, mediaResourceJson, domains } from "./types";
import { EmbedBuilder } from "discord.js";
import { ordinate } from "../../utils";
export default class DiscordVRV {
  cache: cache;

  Bobb: Bobb;
  VRV: VRV;
  constructor(Bobb: Bobb, VRV: VRV) {
    this.Bobb = Bobb;
    this.cache = {};
    this.VRV = VRV;
  }

  /**
   * @description Search for an anime using a query and cache the user ID
   * @param {string} query - A string param.
   * @param {string} id - ID of Discord User
   * @returns {Promise<VRVret>} This is the result
   */
  async search(query: string, id: string): Promise<VRVret> {
    if (!this.VRV.cmsSigning.Policy) {
      let cmsSigns = await this.VRV._getCMS();
      let retries = 0;
      while (cmsSigns.success === false) {
        cmsSigns = await this.VRV._getCMS();
        retries += 1;
        if (retries >= 15) break;
      }

      if (retries >= 15) return { success: false, error: cmsSigns.error };
    }
    let s = await this.VRV._vGetData({
      url: this.VRV.config.premium ? domains.premSearch : domains.search,
      note: `Searching for ${query}`,
      type: "disc",
      query: new URLSearchParams([
        ["q", query],
        ["n", "6"],
      ]).toString(),
    });
    if (!s.success)
      return { success: false, error: "Error while searching for anime" };
    s = s.res.body;
    if (s.total === 0)
      return { success: false, error: "Could not find that anime!" };
    s = s.items.filter(
      (res: searchItem): boolean => res.total > 0 && res.type === "series"
    )[0];
    if (!s)
      return {
        success: false,
        error: "Could not find a series matching that query!",
      };
    let res: Array<string> = [];
    await this.Bobb.utils.asyncForEach(
      s.items,
      async (ani: { title: string; id: string }): Promise<void> => {
        let seasons = await this.VRV._vGetData({
          url: this.VRV.config.premium ? domains.premSeasons : domains.seasons,
          note: `Getting seasons for ${ani.title}`,
          type: "cms",
          query: new URLSearchParams({ series_id: ani.id }).toString(),
        });
        if (!seasons.success)
          res.push(`${ani.title} • Unable to get seasons..`);

        await this.Bobb.utils.asyncForEach(
          seasons.res.body.items,
          (ani: { title: string; id: string }): number =>
            res.push(`${ani.title}　•　${ani.id}`) // push returns the new length of array.
        );
      }
    );

    // importantn!! add :string as return type of this. not doing it now cuz the syntax highlighting gets ugly
    res = res.map(
      (a: string, index: number): string => `${ordinate(index + 1)}　•　${a}`
    );
    this.cache[id].searchQuery = query;
    this.cache[id].searchRes = res;
    return {
      success: true,
      res,
    };
  }

  /**
   * @description Choose an anime from the search results and cache it
   * @param {string} choice - numerical choice. 2nd, 3rd, 4th, etc.
   * @param {string} id - ID of Discord User
   * @returns {Promise<VRVret>} This is the result
   */
  async choose(choice: number | string, id: string): Promise<VRVret> {
    if (!choice)
      return {
        success: false,
        error: "Please input a choice from your search results.",
      };
    choice = choice.toString();
    if (!this.cache[id]) this.initPerson(id);
    if (
      !this.cache[id].searchRes ||
      this.cache[id].searchRes === undefined ||
      this.cache[id].searchRes === null
    )
      return { success: false, error: "Please search for an anime first." };
    let ind: number | null; // index of choice id

    if (choice.slice(-2).match(/st|nd|rd|th/g)) {
      ind = parseInt(choice.slice(0, -2))
        ? parseInt(choice.slice(0, -2))
        : null;
      if (
        !ind ||
        (!this.cache[id].searchRes?.[ind - 1] &&
          !this.cache[id].searchRes?.find(
            (i: string) => i.split("　•　")[0] === choice
          ))
      )
        return {
          success: false,
          error: "Make sure the ordinal id input is correct!",
        };

      this.cache[id].choiceID =
        this.cache[id].searchRes?.[ind - 1].split("　•　")[2];
      this.cache[id].choiceTitle =
        this.cache[id].searchRes?.[ind - 1].split("　•　")[1];
    } else if (typeof parseInt(choice) === "number") {
      ind = parseInt(choice);
      if (!ind || !this.cache[id].searchRes?.[ind - 1])
        return { success: false, error: "Make sure the  id input is correct!" };
      this.cache[id].choiceID =
        this.cache[id].searchRes?.[ind - 1].split("　•　")[2];
      this.cache[id].choiceTitle =
        this.cache[id].searchRes?.[ind - 1].split("　•　")[1];
    } else return { success: false, error: "Did not receive an ok choice.." };
    if (!this.cache[id].choiceID || !this.cache[id].choiceTitle)
      return {
        success: false,
        error: "Something happened while choosing that anime :<",
      };
    let episodes = await this.VRV._vGetData({
      url: this.VRV.config.premium ? domains.premEpisodes : domains.episodes,
      note: `Getting episodes for ${this.cache[id].choiceTitle}`,
      type: "cms",
      query: new URLSearchParams({
        season_id: this.cache[id].choiceID!,
      }).toString(),
    });
    if (!episodes.success)
      return {
        success: false,
        error: "Trouble getting episodes of the anime you chose :(",
      };
    if (episodes.res.body.total <= 0)
      return {
        success: false,
        error: `No episodes found for ${this.cache[id].choiceTitle}`,
      };

    this.cache[id].aniEps = episodes.res.body.items.map(
      (ep: mediaResourceJson, index: number): string =>
        `${ordinate(index + 1)} Episode　•　${ep.title}　•　${
          ep.__links__.streams.href.split("/")[
            ep.__links__.streams.href.split("/").length - 2
          ]
        }`
    );
    return {
      success: true,
      res: this.cache[id].aniEps,
      title: this.cache[id].choiceTitle,
    };
  }

  /**
   * @description get the stream URL for each ep num, cache it
   * @param {Array<number>} eps - The episode numbers to get
   * @param {string} id - ID of Discord User
   * @returns {Promise<VRVret>} This is the result
   */
  async getStream(eps: Array<number>, id: string): Promise<VRVret> {
    let st = Date.now();

    if (
      !this.cache[id].choiceID ||
      !this.cache[id].choiceTitle ||
      !this.cache[id].aniEps
    )
      return { success: false, error: "Please choose an anime first!" };
    let epMedia: any = {};

    for (let epNum of eps) {
      this.cache[id].selEp =
        epNum.toString().toLowerCase() == "latest"
          ? this.cache[id]!.aniEps?.[this.cache?.[id]!.aniEps?.length! - 1]
          : this.cache[id]!.aniEps?.[epNum - 1];

      if (!this.cache[id].selEp)
        return {
          success: false,
          error: `Input a valid episode number from the list. ${epNum} is invalid`,
        };
      let epGetStart = Date.now();
      let streams = await this.VRV._vGetData({
        url: `${this.VRV.config.premium ? domains.premStream : domains.stream}${
          this.cache[id]!.selEp?.split("　•　")[2]
        }/streams?`,
        note: `Getting streams for ${this.cache[id]!.selEp?.split("　•　")[1]}`,
        type: "cms",
      });
      if (!streams.success)
        return {
          success: false,
          error: `Error while getting the streams for ${
            this.cache[id].selEp?.split("　•　")[1]
          }`,
        };

      let streamBody = streams.res.body;
      if (
        streamBody &&
        streamBody.streams &&
        streamBody.streams.adaptive_hls &&
        (streamBody.streams.adaptive_hls["en-US"] ||
          streamBody.streams.adaptive_hls[""])
      ) {
        epMedia[epNum] = {
          streamURL:
            (streamBody.streams.adaptive_hls["en-US"] &&
              streamBody.streams.adaptive_hls["en-US"].url) ||
            (streamBody.streams.adaptive_hls[""] &&
              streamBody.streams.adaptive_hls[""].url),
          epTitle: this.cache[id].selEp?.split("　•　")[1],
          timeTaken: Date.now() - epGetStart,
        };
      } else
        return {
          success: false,
          error: `Trouble parsing for streams for episode ${epNum}`,
        };
    }

    return {
      success: true,
      epMedia,
      timeTaken: Date.now() - st,
    };
  }

  /**
   * @param {string} id - Discord Snowflake to see who fetched what
   * @returns {void}
   */
  initPerson(id: string): void {
    //@ts-ignore
    this.cache[id] = {};
    /* searchQuery: string,
       searchRes: Array<string>,
       choiceID: string,
       choiceTitle: string,
       aniEps: Array<string>,
       selEp: string,
       embed: MessageEmbed,
       date: Date
    */
  }

  /**
   * @param {string} id - ID of Discord User
   * @param {EmbedBuilder} embed - The embed to set to cache
   * @returns {void} Doesn't return--only a setter
   */
  setCacheEmbed(id: string, embed: EmbedBuilder) {
    if (!this.cache[id]) throw new Error(`did not initperson ${id} yet.`);
    this.cache[id].embed = embed;
    this.cache[id].date = new Date();
  }
}
