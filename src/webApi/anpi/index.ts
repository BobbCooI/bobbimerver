import express, { Request, Response } from "express";
const router = express.Router();
import apiKeys from "../secret";
import {verify} from "../../../lib/utils/utils";
import config from "../../config.json"
router.use(
  "/",
  async (req: Request, res: Response, next: any) : Promise<any> => {
    const apiKey = req.get(config.headerAni!);
    const authHeader = req.get("Authorization");
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null)
      return res.send({ success: false, error: "Unauthorized..." });
    try {
      let isAuth = await verify(token);

      if (apiKeys.has(apiKey) && isAuth) {
        next();
        return;
      } else {
        return res.json({ success: false, error: "You are not authorized.." });
        //   next(error);
      }
    } catch (e) {
      return res.send({
        success: false,
        error: "Session has expired.",
        logout: true
      });
    }
  },
  async (_req: Request, _res: Response, next: any) => {
    // in memory cache
    /*  if (cacheTime && cacheTime > Date.now() - 30 * 1000) {
    // BTW - set a cache header so browsers work WITH you.
    //  using manual cache instead of 'Cache-Control' ie res set('Cache-Control', 'public, max-age=300, s-maxage=600') ?
    return res.json(cachedData);
  }*/
    try {
      next();
      return;
    } catch (error) {
      return { success: false, error: error.message || error.error };
    }
  }
);
import gogo from "./gogo";
import geteps from "./geteps";
router.use("/gogo", gogo);
router.use("/geteps",geteps);
export default router;
