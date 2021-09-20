import fs from 'fs';

const listeners = fs.readdirSync(__dirname)
  .filter(l => l !== 'index.js' && l !=="index.ts"&& !l.endsWith(".map") && !l.includes("Old"))
  .map(l => l.split('.')[0]);

export default listeners;