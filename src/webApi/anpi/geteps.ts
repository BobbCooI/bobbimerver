import express, {Request, Response} from "express";
const router = express.Router();
import axios from "axios";
import Sustain from "../../../lib/db/models/Sustain";
import {createWebhook} from "../../../lib/utils/utils";
router.post("/", async (req: Request, res: Response): Promise<any> => {
  if (req.body.pages && req.body.id) {
    try {
      let eps: Array<any> = [];
      let malID = req.body.id;
      for (let i = 1; i <= req.body.pages; i++) {
        let link = `https://api.jikan.moe/v3/anime/${malID}/episodes/${i}`;
        if (req.body.airing) {
          if (i == req.body.pages) {
            let posib = await Sustain.findOne({ reqLink: link });
            if (posib) {
              let isUpdated = await axios.get(link, {
                headers: { "If-None-Match": posib.reqHash }
              });
              if (isUpdated.status == 304) {
                let list = await axios.get(link);
                eps.push(...list.data.episodes);
              } else if (isUpdated.status == 200) {
                await Sustain.updateOne(
                  { reqLink: link },
                  { updHash: isUpdated.headers["ETag"] },
                  { upsert: true }
                );
                eps.push(...isUpdated.data.episodes);
              }
            } else {
              let list = await axios.get(link);
              let reqHash = list.data.request_hash;
              let updHash = list.headers["ETag"];
              await Sustain.create({
                reqHash,
                updHash,
                reqLink: link,
                aniID: malID
              });
              eps.push(...list.data.episodes);
            }
          } else {
            let list = await axios.get(link);
            eps.push(...list.data.episodes);
          }
        } else {
          let list = await axios.get(link);
          let reqHash = list.data.request_hash;
          let updHash = list.headers["ETag"];
          await Sustain.updateOne(
            { reqLink: link },
            {
              reqHash,
              updHash
            },
            { upsert: true }
          );

          eps.push(...list.data.episodes);
        }
      }
      let selectedEpTitles: Array<string> = [];
      //	eps =	eps.filter((ep, index)=> ep.aired?(new Date - new Date(ep.aired)) > 0: eps[index + 1] && new Date(eps[index-1] && eps[index - 1].aired).setDate(new Date(eps[index-1]) + 7) > 0);
      eps = eps.filter((ep: any, index: number) =>
        ep.aired
          ? Date.now() - new Date(ep.aired).getTime() > 0
          : eps[index + 1] ||
            (isValidDate(new Date(eps[index - 1] && eps[index - 1].aired)) &&
              Date.now() -
                new Date(eps[index - 1] && eps[index - 1].aired).setDate(
                  new Date(eps[index - 1].aired).getDate() + 7
                ) >
                0)
      );

      eps.forEach(
        ((ep: any) => (selectedEpTitles[ep.episode_id - 1] = ep.title)
      ));
     // const epsLength = eps.length;
      return res.send({
        success: true,
        epTitles: selectedEpTitles,
        episodes: eps
      });
    } catch (e) {
      console.log(e.message);
      await createWebhook({
        embedContent: (e.stack.length < 1980 && e.stack) || e.message,
        type: "error"
      });
      return res.send({ success: false, error: e.message });
    }
  } else res.send({ success: false, error: "invalid.." });
  return res.send({ success: false, error: "invalid.." });
});
router.get("/geteps", (_req: Request, res: Response) => {
  res.send({ success: true, res: "but y u here" });
});
export default router;

function isValidDate(d: any) : boolean {
  return d instanceof Date && (d.toString() !== "Invalid Date");
}
