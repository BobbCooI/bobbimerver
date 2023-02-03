import express, { Request, Response } from "express";
const router = express.Router();

router.use(
  "/",
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

export default router;
