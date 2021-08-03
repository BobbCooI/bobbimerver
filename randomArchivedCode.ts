/* let epNum;
let ep = argManager!.args!.join("").toString()
ep.slice(-2).match(/st|nd|rd|th/g)
  ? (epNum = parseInt(ep.slice(0, -2)))
  : (epNum = parseInt(ep));
if (typeof epNum !== "number" || !person.cache[message!.author.id].aniEps?.[epNum - 1])
  return `Input a valid episode number from the list. It could be \`${
      person.cache[message!.author.id].aniEps?.[1].split(" ")[0]
    }\` or \`${person.cache[message!.author.id].aniEps?.[1]
      .split(" ")[0]
      .slice(0, -2)}\` to get the second episode.`*/