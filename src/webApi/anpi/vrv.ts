import express, { Request, Response } from "express";
const router = express.Router();

router.get("/browse", async (_req: Request, res: Response) => {
  const browseVRV = await res.locals.vrv.Browse();
  if (browseVRV.success) {
    return res.send({ success: true, data: browseVRV.res });
  }

  return res.send({ successful: false, error: browseVRV.error });
});

router.get("/", (_req: Request, res: Response) => {
  res.send("You are not supposed to be here nor log a watch here 🤨");
});

router.get("/series/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (id.length != 9 || !id.startsWith("G")) {
    return {success: false, error: "Invalid anime id"};
  };
  const anime = await res.locals.vrv.getSeasons(id);
  if (anime.success) {
    return res.send({ success: true, data: anime.res });
  }

  return res.send({ success: false, error: anime.error });
});

router.get("/episodes/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (id.length != 9 || !id.startsWith("G")) {
    return {success: false, error: "Invalid anime id"};
  };
  const anime = await res.locals.vrv.getEpisodes(id);
  if (anime.success) {
    return res.send({ success: true, data: anime.res });
  }

  return res.send({ success: false, error: anime.error });
});

router.get("/streams/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (id.length != 9 || !id.startsWith("G")) {
    return {success: false, error: "Invalid anime id"};
  };
  const anime = await res.locals.vrv.getStreams(id);
  if (anime.success) {
    return res.send({ success: true, data: anime.res });
  }

  return res.send({ success: false, error: anime.error });

});
export default router;
