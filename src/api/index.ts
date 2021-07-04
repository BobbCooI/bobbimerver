import express, {Request, Response} from "express";
const router = express.Router();
import apiKeys from "./secret";
import config from "../config.json"
router.use(
  "/",
  (req: Request, res: Response, next: any): any => {
    const apiKey = req.get(config.headerAuth!);
    if (!apiKeys.has(apiKey)) {
      return res.send({success: false, error: "Invalid API Key."})
    }
      next();
return;
      //   next(error);
  },
  async (_req: Request, _res: Response, next: any): Promise<any> => {
    // in memory cache
    /*  if (cacheTime && cacheTime > Date.now() - 30 * 1000) {
    // BTW - set a cache header so browsers work WITH you.
    //  using manual cache instead of 'Cache-Control' ie res set('Cache-Control', 'public, max-age=300, s-maxage=600') ?
    return res.json(cachedData);
  }*/
    try {
      next();
    } catch (error) {
      return { success: false, error };
    }
  }
);
import anpi from "./anpi";
import discord from "./discord";
import visits from "./webVisits";
import auth from "./auth"
router.use("/ani", anpi);
router.use("/discord", discord);
router.use("/visits", visits);
router.use("/auth", auth);
export default router;