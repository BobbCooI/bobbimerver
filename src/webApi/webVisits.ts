import express, { Request, Response } from "express";
const router = express.Router();
import Stats from "../../lib/db/models/Stats";
router.post("/", async (req: Request, res: Response) => {
  if (req.body["increment"]) {
    await Stats.updateOne(
      { _id: "60070be0f12d9e041931de68" },
      { $inc: { websiteVisits: 1 } }
    );
    return res.json({ successful: true });
  } else if (req.body["getVisits"]) {
    let visitCount = await Stats.findOne({ _id: "60070be0f12d9e041931de68" }).catch((e:any) => console.log(e))
    return res.json({ visitCount: visitCount!.websiteVisits });
  } else return res.send("why u here")
});
router.get("/", (_req: Request, res: Response) => {
  res.send("why u here");
});
export default router;
