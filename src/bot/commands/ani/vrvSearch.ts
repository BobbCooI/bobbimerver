import GenericCommand from "../../commandTypes/GenericCommand";
import Discord from "discord.js";
import { runFnArgs} from '../../../types/bot';
import { prefix } from '../../../utils/constants'
export default new GenericCommand(
  {
    triggers: ["vrvsearch", "vsearch"],
    usage: "{command} {searchTerm}",
    description:
      "1/3 - Use this command to search for an anime of your choice with VRV.",
    slashCmd: true,
    slashOpts: {
      name: "vrvsearch",
      description: "Use this command to search. Then use vrvChoose to choose.",
      options: [
        {
          name: "search_query",
          description: "Search for an anime with VRV.",
          type: 3,
          required: true
        }
      ]
    },
    cooldown: 8 * 1000
  },
  async ({ Bobb, message, addCD, argManager }: runFnArgs) => {
  if(!(argManager!.args as Array<string>).length) return `atleast give me something to search up 🙄`
    addCD();
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
    Bobb!.VRV.initPerson(message!.author.id);
    let search = await Bobb!.VRV.search((argManager!.args as string[])!.join(" "), message!.author.id);
    let end = Date.now();
    if (search.success === false) return search.error;
    const Ret =  new Bobb!.Return("message")
    Ret.setEmbeds([
      new Discord.MessageEmbed()
        .setTitle("Choices")
        .setDescription(search.res.join("\n"))
        .setFooter(
          `Time taken: ${Bobb!.utils.timeMili(
            end - startTime
          )} - You can choose like this: ${prefix}vrvChoose 1st`
        )
    ]);
    
    return Ret;
  },
  async ({ Bobb, interaction, argslash, addCD }: runFnArgs) => {
    addCD();
        let startTime = Date.now();
   /* if (Bobb!.client!.vrvCache[interaction!.user.id])
      delete Bobb!.client.vrvCache[interaction!.user.id];

    let base = Bobb!.client.vrvCache[interaction!.user.id] = new Bobb!.VRV(
      interaction!.user.id,
      Bobb
    );
    await base.init();
    let auth = await Bobb.VRV.auth();
    if (!auth.success) return `Oh no! ${auth.error}`;*/
    Bobb!.VRV.initPerson(interaction!.user.id);
    let search = await Bobb!.VRV.search(argslash!.get("search_query")!.value, interaction!.user.id);
    let end = Date.now();
    if (search.success === false) return search.error;

    const Ret = new Bobb!.Return("interaction")
    Ret.setEmbeds([
      new Discord.MessageEmbed()
        .setTitle("Choices")
        .setDescription(search.res.join("\n"))
        .setFooter(
          `Time taken: ${Bobb!.utils.timeMili(
            end - startTime
          )} - You can choose like this: /vrvChoose 1`
        )
    ]);
return Ret;
  }
);
