import Bobb from '../bot/botClass';
import { commandAttr } from '../types/bot';
import {iUser} from '../db/models/Person';
export default (Bobb: Bobb) => ({
  async fetchMemberInfo(search:any): Promise<iUser> {
    return Bobb.mongo.Person.findOne(search).catch((e:any) => Bobb.loggers.log(e.stack.length<1990?e.stack:e.message + "function: fetchMemberInfo", "error"))
  },

  async updateMember(search:any, update:any):Promise<iUser> {
   let ok = await Bobb.mongo.Person.findOneAndUpdate(search, update, {new: true}).catch((e:any) => Bobb.loggers.log(e.stack.length < 1990?e.stack:e.message + "function: updateMember", "error"));
return ok
},
   async updateBal(memberID:string, amt:number): Promise<iUser> {
   return this.updateMember({discID: memberID}, {$inc: {balance: amt}}).catch((e:any) => Bobb.loggers.log(e.stack.length < 1990?e.stack:e.message + "function: updateBal->updateMember->findOneAndUpdate Person", "error"));
  },
 
 async updateCooldowns(command: string, userID: string): Promise<any> {
    const pCommand = Bobb.cmds.find(c =>
      c.props.triggers.includes(command.toLowerCase())
    );
    if (!pCommand) {
      return;
    }
    let cooldown = pCommand.props.cooldown;

    const profile = await this.getCooldowns(userID, false);
    if (!profile) {
      return this.createCooldowns(command, userID);
    }
    if (profile.cooldowns.some((cmd:any) => cmd[command])) {
      profile.cooldowns.forEach((cmd: any) => {
        if (cmd[command]) {
          cmd[command] = Date.now() + cooldown;
        }
      });
    } else {
      profile.cooldowns.push({ [command]: Date.now() + cooldown });
    }
    if (cooldown) {
      return Bobb.cooldowns.set(userID, {
        id: userID,
        cooldowns: profile.cooldowns
      });
    }
  },

  async createCooldowns(command: any, userID: string): Promise<any> {
    const pCommand = Bobb.cmds.find(c =>
      c.props.triggers.includes(command.toLowerCase())
    );
    if (!pCommand) {
      return;
    }
    const cooldown = pCommand.props.cooldown;
    if (cooldown) {
      return Bobb.cooldowns.set(userID, {
        id: userID,
        cooldowns: [{ [command]: Date.now() + cooldown }]
      });
    } else {
      return console.error(`No cooldown for following command: ${pCommand}`);
    }
  },
 getCooldowns(userID: string, type: string|boolean): any {
    let all = type === "all";
    if (all || type !== "db") {
      const cooldown = Bobb.cooldowns.get(userID) || {
        cooldowns: [],
        id: userID
      };
      if (!all) {
        return cooldown;
      } else {
        all = cooldown;
      }
    }
    return all;
  },

 deleteCooldowns(userID: string): void {
    Bobb.cooldowns.delete(userID);
  },

async getSpecificCooldown(command: commandAttr, userID: string):Promise<any> {
    const profile = Bobb.cooldowns.get(userID);
    if (!profile) {
      return null;
    }
    const cooldowns = profile.cooldowns.find((item:any) => item[command.triggers[0]]);
    if (!cooldowns) {
      return null;
    }
    return profile.cooldowns.find((item:any) => item[command.triggers[0]])[
      command.triggers[0]
    ];
  },
  async addSpam(id:string): Promise<void> {
    await this.updateMember({discID: id}, { $inc: { cmdSpam: 1 } });
  }

});