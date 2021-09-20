import Discord from "discord.js";
import { executeArgs } from "lib/bot/botTypes";
import { Command } from "../../../../lib/bot/Command";
export default new Command(
  {
    name: "vrvsearch",
    description: "1/3: Search for an anime of your choice with VRV.",
    enableSlashCommand: true,
      args: [
        {
          id: "search_query",
          description: "search query",
          type: "string",
          default: undefined,
          required: true
        }
      ],
    cooldown: 8 * 1000
  },
  async ({ Swessage, addCD }: executeArgs) => {
  
  if(!(Swessage.args?.get("search_query")?.value)) return `atleast give me something to search up 🙄`
    addCD?.();
        let startTime = Date.now();
/*let base =Bobb!.client.vrvCache[message!.author.id];
    if (!base) {
     base = (Bobb!.client.vrvCache[message!.author.id] = new Bobb!.VRV(
      message!.author.id,
      Bobb
    ));
    await base.init();
    let auth = await base.auth();
    if (!auth!.success) return `Oh no! ${auth.error}`;
    }  */
    Swessage.Bobb.VRV.initPerson(Swessage.author.id);
    let search = await Swessage.Bobb.VRV.search(Swessage.args?.get("search_query")?.value, Swessage.author.id);
    let end = Date.now();
    if (search.success === false) return search.error;
    const Ret =  new Swessage.Bobb.Return(Swessage.Bobb)
    Ret.setEmbeds([
      new Discord.MessageEmbed()
        .setTitle("Choices")
        .setDescription(search.res.join("\n"))
        .setFooter(
          `Time taken: ${Swessage.Bobb.utils.timeMilli(
            end - startTime
          )} - You can choose like this: ${Swessage.Bobb.config.prefix}vrvChoose 1st`
        )
    ]);
    
    return Ret;
})
