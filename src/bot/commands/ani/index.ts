import fs from "fs";
let commands = fs
  .readdirSync(__dirname)
  .filter((c: string) => c !== "index.js" && c !== "index.ts" && !c.startsWith("cr") && !c.endsWith(".map"))
.map( (c: string) => import(`${__dirname}/${c}`));
export default {
  commands,
  name: "👻 Anime",
  description: "Get your favorite show :)"
};
