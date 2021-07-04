import GenericCommand from "../../commandTypes/GenericCommand";
import { runFnArgs} from '../../../types/bot';
export default new GenericCommand(
  {
    triggers: ["bypcd", "bypasscd"],
    usage: "{command} <commandName>",
    bypass: true,
    description: "See all the commands",
    slashCmd: true,
    slashOpts: {
      name: "bypasscooldown",
      description: "bypass cooldown for commands",
      options: [
        {
          name: "user",
          description: "user to toggle cooldown bypassing",
          type: 6,
          required: false
        }
      ],
    },
    ownerOnly: true
  },
  async ({ Bobb,message, argManager }: runFnArgs) => {
    
    const user = argManager!.resolveUser() || message!.author;
    
    const success = await Bobb!.mongo.Person.toggleBypassCD(user.id);
    if(success) return `Successfully toggled cooldown bypass to \`${success}\` for ${user}!`
  else return "Unsuccessful.. is the user in the database?"
  })