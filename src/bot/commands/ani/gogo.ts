import GenericCommand from "../../commandTypes/GenericCommand";
import { runFnArgs } from "../../../types/bot";
import getGogo from '../../../utils/scrapers/gogo';
export default new GenericCommand(
  {
    triggers: ["gogo"],
    usage: "{command} {link}",
    description: "fetches gogo stream using a given url. (`https://gogo-play.net`)",
    slashCmd: true,
    slashOpts: {
      name: "gogo",
      description: "fetches gogo stream using a given url. (`https://gogo-play.net`)",
      options: [
        {
          name: "link",
          description: "gogo link (`https://gogo-play.net`)",
          type: 3,
          required: true
        }
      ]
    },
    cooldown: 8 * 1000
  },
  async ({Bobb,  argManager , addCD}: runFnArgs) => {
 try {
    let mainURL = await getGogo(argManager!.args?.[0] || '');
    if(mainURL) {
      addCD();
      return Bobb!.utils.decode64(mainURL.link);
    } else {
    throw new Error('unknown error 😮‍💨')
    }
 } catch(e) {
   return e.toString() || 'there was an error fetching with that link..'
 }
  }, async ({Bobb ,argslash, addCD}: runFnArgs) => {
   try {
    let mainURL = await getGogo(argslash!.get('link')!.value as string)
    if(mainURL) {
      addCD()
      return Bobb!.utils.decode64(mainURL.link);
    } else throw new Error('unknown error 😮‍💨')
     
   } catch(e) {
    return e || 'there was an error fetching with that link..'
   }
})