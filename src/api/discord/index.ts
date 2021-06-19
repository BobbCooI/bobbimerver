import express from "express";
const router = express.Router();
const dev = require("./devs");
// split up route handling
router.use("/devs", dev.getDevs);
// etc.

export default router;
