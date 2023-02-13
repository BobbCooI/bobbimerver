import express, { Request, Response } from "express";
const router = express.Router();

router.use(
  "/",
  async (_req: Request, _res: Response, next: any) => {
     return next();
  }
);

import vrv from "./vrv";
// split up route handling
router.use("/vrv", vrv);



export default router;
