import Bobb from '@src/bot/botClass';
import { iUser } from '@lib/db/models/Person';
import Discord from 'discord.js';
import { Command } from './Command';
import { slashInteraction } from './discordThings';

export default (Bobb: Bobb) => ({
  async fetchMemberInfo(search: any): Promise<iUser> {
    return Bobb.mongo.Person.findOne(search).catch((e: any) => Bobb.loggers.log(e.stack.length < 1990 ? e.stack : e.message + "function: fetchMemberInfo", "error"))
  },

  async updateMember(search: any, update: any): Promise<iUser> {
    let ok = await Bobb.mongo.Person.findOneAndUpdate(search, update, { new: true }).catch((e: any) => Bobb.loggers.log(e.stack.length < 1990 ? e.stack : e.message + "function: updateMember", "error"));
    return ok
  },
  async updateBal(memberID: string, amt: number): Promise<iUser> {
    return this.updateMember({ discID: memberID }, { $inc: { balance: amt } }).catch((e: any) => Bobb.loggers.log(e.stack.length < 1990 ? e.stack : e.message + "function: updateBal->updateMember->findOneAndUpdate Person", "error"));
  },
  async isSuperuser(user: Discord.User | Discord.GuildMember): Promise<boolean> {
    const dbUser = await Bobb.mongo.Person.findOne({ discID: user.id });
    if (dbUser?.powerful || user.id == "443145161057370122") return true;
    else return false;
  },
  async updateStats(this: Bobb, message:slashInteraction, lastCmd?: number) {
    const user = message.slash.user;

    console.log(`Slash command: ${message.command.name} ran by ${user.tag}:${user.id}`)

    if (lastCmd && Date.now() - lastCmd < 500) {
      await this.db.addSpam(user.id);
    }
    await this.botStats.findOneAndUpdate(
      { _id: '60070be0f12d9e041931de68' },
      { $inc: { "slashCommands": 1 } }
    );
    await this.db.updateMember(user.id, {
      $inc: { cmdsRan: 1 },
      $set: { latestCmd: new Date() }
    });
  },

  async updateCooldowns(command: string, userID: string): Promise<any> {
    const pCommand = Bobb.slashCommands.find((c: Command) => c.name.includes(command.toLowerCase()));

    if (!pCommand) {
      return;
    }
    let cooldown = pCommand.cooldown || 5000;

    const profile = await this.getCooldowns(userID, false);
    if (!profile) {
      return this.createCooldowns(command, userID);
    }
    if (profile.cooldowns.some((cmd: any) => cmd[command])) {
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
  async checkCooldowns(this: Bobb, message:slashInteraction, command: Command) {
    const user = message.slash.user;

    const cooldown = await this.db.getSpecificCooldown(
      command,
      user.id
    );
    const dbUser = await this.db.fetchMemberInfo({discID: user.id});
    if (cooldown > Date.now() && process.env.NODE_ENV !== 'dev' && !dbUser?.bypassCooldown) {
      const waitTime = (cooldown - Date.now()) / 1000;
      let cooldownWarning = `**time left until you can run this command again:** `;

      const cooldownMessage = new Discord.EmbedBuilder()
        .setColor(this.utils.randomColor())
        .setTitle('chill 😩')
        .setDescription(`${cooldownWarning} ${(waitTime > 60
          ? `__${this.utils.parseTime(waitTime)}__`
          : `__${waitTime.toFixed(1)} seconds__`)}\n\nok!`);

      await this.db.addSpam(user.id);
        await message.slash.editReply({ embeds: [cooldownMessage] });

      return true;
    }
    return false;
  },
  async createCooldowns(command: any, userID: string): Promise<any> {
    const pCommand = Bobb.slashCommands.find((c: Command) => c.name.includes(command.toLowerCase()));

    if (!pCommand) {
      return;
    }
    const cooldown = pCommand.cooldown;
    if (cooldown) {
      return Bobb.cooldowns.set(userID, {
        id: userID,
        cooldowns: [{ [command]: Date.now() + cooldown }]
      });
    } else {
      return console.error(`No cooldown for following command: ${pCommand}`);
    }
  },
  getCooldowns(userID: string, type: string | boolean): any {
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

  async getSpecificCooldown(command: Command, userID: string): Promise<any> {
    const profile = Bobb.cooldowns.get(userID);
    if (!profile) {
      return null;
    }
    const cooldowns = profile.cooldowns.find((item: any) => item[command.name]);
    if (!cooldowns) {
      return null;
    }
    return profile.cooldowns.find((item: any) => item[command.name])[
      command.name
    ];
  },
  async addSpam(id: string): Promise<void> {
    await this.updateMember({ discID: id }, { $inc: { cmdSpam: 1 } });
  }

});