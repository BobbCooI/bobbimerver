import express, { Request, Response } from "express";
const router = express.Router();

router.use(
  "/",
  async(req: Request, _res: Response, next: any) => {
    // WORK ON AUTHORIZATION HERE. NOTHING IS REQUESTED TO 
    // THIS API WITHOUT A GOOD NEXTAUTH SESSION

  console.log("JSON Web Token", req.cookies)
      //return res.send({ success: false, error: "Invalid API Key." });
   
    next();
  },
  async (_req: Request, _res: Response, next: any): Promise<any> => {
    // after authorization, can check cache for data requested here

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
)
import anpi from "./anpi";
import discord from "./discord";
import visits from "./webVisits";
router.use("/ani", anpi);
router.use("/discord", discord);
router.use("/visits", visits);
export default router;