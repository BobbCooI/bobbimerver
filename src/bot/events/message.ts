

import Discord, {Message, GuildChannel, Permissions, TextChannel} from "discord.js";
import {AUTORESPONSE_MATRIX, SWEARWORDS, gifs} from '../../utils/constants';
import  GenericCommand from '../commandTypes/GenericCommand';
import Bobb from '../botClass';
import _ from 'lodash';
exports.handle = async function(message: Message): Promise<Message|undefined|null|void> {
 let st = Date.now();

  if (message.author.bot) {
    return;
  }
  /*  if (
    this.config.options.dev &&
    !this.config.options.developers.includes(message.author.id)
  ) {
    return;
  }*/

 await this.botStats.findOneAndUpdate({ _id: "60070be0f12d9e041931de68" }, { $inc: { messages: 1 } });
 await cacheMessage.call(this, message);
/*  let slicedMessage = message.content.split(/\s+/g);
  let passed;
  if (
    PREMATURE_REQUIREMENTS.find((a:string) => message.content.toLowerCase().includes(a))
  ) {
    passed = true;
  } else if (slicedMessage.length > 1) {
    for (const possibleCommand of slicedMessage) {
      if (
        this.cmds.find((c: GenericCommand) =>
          c.props.triggers.includes(possibleCommand.toLowerCase())
        ) //||   this.tags[possibleCommand.toLowerCase()]
      ) {
        passed = true;
      }
    }
  }*/
  // if (!passed || await this.db.checkBlocked(msg.author.id, msg.channel.guild.id)) { return; }   BLACKLISTED?
  const guildID = message.guild ? message.guild.id : false;
  const gConfig = guildID
    ? await this.db.getGuild(guildID)
    :  { prefix: process.env.prefix }; // this method takes like 500-1000 milliseconds.
gConfig.prefix = this.client.prefix;
 gConfig.disabledCategories = gConfig.disabledCategories
    ? gConfig.disabledCategories
    : [];
  gConfig.enabledCommands = gConfig.enabledCommands
    ? gConfig.enabledCommands
    : [];
  gConfig.disabledCommands = gConfig.disabledCommands
    ? gConfig.disabledCommands
    : [];

  if (!gConfig.autoResponse) {
    gConfig.autoResponse = {
      dad: false,
      ree: false,
      sec: false,
      nou: false
    };
  }
  // Auto responses
  for (const autoResponse in gConfig.autoResponse) {
    if (gConfig.autoResponse[autoResponse]) {
      const entry = AUTORESPONSE_MATRIX[autoResponse];
      const match = entry.regex.exec(message.content);
      if (match) {
        const result = await entry.parse(match);
        if (result.length <= 2000) {
          message.channel.send(result);
        }
      }
    }
  }

  // Swear detection
  if (gConfig.swearFilter) {
    if (SWEARWORDS.some((word: string) => message.content.toLowerCase().includes(word))) {
      message.channel.send(
        `No swearing in this christian server :rage:\n${await message
          .delete()
          .then(() => "")
          .catch(() => {
            return message.channel.send(
              "I couldn't remove the offending message because I don't have `Manage Messages` :("
            );
          })}`
      );
    }
  }

  const selfMember = message.guild
    ? message.guild.me
    : { nickname: false, id: "747231069002006609" };
  let mention = `<@${selfMember?.nickname? "!" : ""}${selfMember?.id}>`;
  const wasMentioned = message.content.startsWith(mention);
  if (message.content.slice(mention.length)[0] === " ")
    mention = mention += " ";
  const triggerLength = (wasMentioned ? mention : gConfig.prefix).length;

  //const cleanTriggerLength = (wasMentioned? `@${selfMember?.nickname || selfMember?.user?.username}`: gConfig.prefix).length;
//gConfig.prefix = "c!"
  if (
    !message.content.toLowerCase().startsWith(gConfig.prefix) &&
    !wasMentioned
  ) {
    return;
  }

  let args: string[] = message.content.slice(triggerLength).split(/ +/g);
  let command: any = args[0];
args = args.slice(1)
/*const cleanArgs = message.cleanContent
    .slice(cleanTriggerLength)
    .split(/ +/g)
    .slice(1); */// Preserving this so it doesn't break anything
  // You should use msg.args.cleanContent(consumeRest: boolean), though
  command =
    command &&
    this.cmds.find((c: GenericCommand) => c.props.triggers.includes(command.toLowerCase()));
  // let isDonor = await this.db.checkDonor(msg.author.id);
  // if (isDonor) { this.ddog.increment(`user.donor`); }
  //  const isGlobalPremiumGuild = await this.db.checkGlobalPremiumGuild(msg.channel.guild.id);
  if (
    !command &&
    message?.mentions?.has(this?.client?.user?.id || "747231069002006609") &&
    message.content.toLowerCase().includes("hello")
  ) {
    return message.channel.send(
      `Hello, ${message.author.username}. My prefix is \`${gConfig.prefix}\`. Example: \`${gConfig.prefix} meme\``
    );
  } else if (
    !command ||
    (command.props.ownerOnly &&
      !this.config.options.developers.includes(message.author.id)) ||
    gConfig.disabledCommands.includes(command.props.triggers[0]) ||
    ((gConfig.disabledCategories || []).includes(
      command.category.split(" ")[1].toLowerCase()
    ) &&
      !["disable", "enable"].includes(command.props.triggers[0]) &&
      !gConfig.enabledCommands.includes(command.props.triggers[0]))
  ) {
    return;
    /* } else if (command.props.donorOnly && !isDonor && (!isGlobalPremiumGuild || command.props.triggers.includes('redeem')) && !this.config.options.developers.includes(msg.author.id)) {
    if (command.props.isNSFW) {
      return message.channel.createMessage('Oi it\'s no nut november, you can fap again next month. Only our donors (`pls donate`) can bypass no nut november rules\n<https://www.youtube.com/watch?v=LNe2ecXj95U>');
    }
    return message.channel.createMessage('This command is for donors only. You can find more information by using `pls donate` if you are interested.');
  */
  }
//const bypass = command.props.bypass;
  if (command.props.dmOnly && message.channel.type !== "dm") return;

  let runner = await this.db.fetchMemberInfo({ discID: message.author.id });
/*console.log(runner, !bypass, message.channel.type !== "dm")
  if (!runner && !bypass && message.channel.type !== "dm")
    return message.channel.send("Please verify in DMs before using commands. ");*/
  let cmdSpam = runner ? runner.spam : 0;
  let latestCmd = runner ? runner.latestCmd : false;

  if (cmdSpam > 10500) {
    try {
      await message.author.send(
        "You have been blacklisted from the bot for spamming over 10,000 times. Nice.\nYou can appeal at this link and we will check it within 2 weeks"
      );
    } catch (e) {
     await this.loggers.log(`User ${message.author.username}#${message.author.discriminator} (${message.author.id}) did not get the appeal DM. Error ${e.message}`);
    }
    return;
  }

 await updateStats.call(this, message, command, latestCmd);

  const isInCooldown = await checkCooldowns.call(this, message, command);
  if (isInCooldown) {
    return;
  }
  const updateCooldowns = () =>
    this.db.updateCooldowns(command.props.triggers[0], message.author.id);

  try {
    let permissions:any = new Permissions().add([Permissions.FLAGS.SEND_MESSAGES]);
    if (message.guild) {
      permissions = (message.channel as GuildChannel)?.permissionsFor(message.guild.me! );
    }
    if (command.props.perms.some((perm: any) => !permissions.has(perm))) {
      checkPerms.call(this, command, permissions, message);
    } else if (
      command.props.isNSFW &&
      message.guild && 
      message.channel.type.toUpperCase() !== "DM" &&
      !(message.channel as TextChannel).nsfw
    ) {
      message.channel.send({
        embeds: [new Discord.MessageEmbed()
         .setTitle("NSFW not allowed here")
         .setDescription("Use NSFW commands in a NSFW marked channel (look in channel settings, dummy)")
         .setColor(this.misc.randomColor())         
         .setImage(gifs.nsfw)        
        ]
      });
    }
    else {

      await runCommand.call(
        this,
        command,
        message,
        args,
        updateCooldowns,
        permissions
      );
    }
    console.log(`Command ${command.props.triggers[0]} took: ${Date.now() - st}ms to run.`)
  } catch (e) {
    this.loggers.reportError.call(this, e, message, command, args);
  }
};

async function cacheMessage(this: Bobb,msg: Message): Promise<void> {
  if (!msg.content || msg.author.bot) {
    // Ignore attachments without content
    return;
  }
  if(msg.channel.id == "739273462559932446") return;
  const guildID = msg.guild ? msg.guild.id : "DMs";
 await this.loggers.cacheMessage(
      new Discord.MessageEmbed()
        .setTitle(`Message ID - ${msg.id}`)
        .setDescription(
          JSON.stringify({
            userID: msg.author.id,
            content: msg.content,
            timestamp: msg.createdTimestamp,
            guildID: guildID,
            channelID: msg.channel.id
          })
        )
    );
}

async function updateStats(this: Bobb, message:Message, command: GenericCommand, lastCmd: number) {
  console.log(command.props.triggers[0])
  if (lastCmd && Date.now() - lastCmd < 500) {
    await this.db.addSpam(message.author.id);
  }
 await this.botStats.findOneAndUpdate(
    { _id: "60070be0f12d9e041931de68" },
    { $inc: { commands: 1 } }
  );
  await this.db.updateMember(message.author.id, {
    $inc: { cmdsRan: 1 },
    $set: { latestCmd: new Date() }
  });
}
async function checkCooldowns(this:Bobb,message:Message, command: GenericCommand) {
  const cooldown = await this.db.getSpecificCooldown(
    command.props,
    message.author.id
  );
  if (cooldown > Date.now() && process.env.NODE_ENV !== "dev") {
    const waitTime = (cooldown - Date.now()) / 1000;
    let cooldownWarning =
      command.props.cooldownMessage ||
      `__Time left until you can run this command again:__ `;

    const cooldownMessage = new Discord.MessageEmbed()
    .setColor(this.misc.randomColor())
    .setTitle("hold on 😩")
    .setDescription(cooldownWarning +
          (waitTime > 60
            ? `**${this.misc.parseTime(waitTime)}**`
            : `**${waitTime.toFixed()} second${parseInt(waitTime.toFixed())>1?"s":""}**`) +
          `\n\n**Default Cooldown**: ${this.misc.parseTime(
            command.props.cooldown / 1000
          )}\n**[Donor]() Cooldown**: ${this.misc.parseTime(
            command.props.cooldown / 1000
          )}\n\ntoo fast yo`
      );

    await this.db.addSpam(message.author.id);
    message.channel.send({embeds: [cooldownMessage]});
    return true;
  }
  return false;
}

function checkPerms(this:Bobb,command:GenericCommand, permissions:any, message:Message):void {
  const neededPerms = command.props.perms.filter(
    (perm: any) => !permissions.has(perm)
  );
  if (permissions.has(Permissions.FLAGS.SEND_MESSAGES)) {
    if (permissions.has(Permissions.FLAGS.EMBED_LINKS)) {
      message.channel.send({embeds: [
        new Discord.MessageEmbed()
        .setTitle("oh no!")
        .setDescription(`You need to add **${
            neededPerms.length > 1 ? neededPerms.join(", ") : neededPerms
          }** to use this command!\nGo to **Server settings => Roles => asuna-kun** to change this!`)
        .setColor(this.misc.randomColor())
        .setImage(
            neededPerms.length === 1
              ? gifs[neededPerms[0] as string]
              :  gifs.manageMessages)
        .setFooter( "If it still doesn't work, check channel permissions too!")
      ]});
    } else {
      message.channel.send(
        `You need to add **${neededPerms.join(
          ", "
        )}** to use this command!\n\nGo to **Server settings => Roles => Dank Memer** to change this!`
      );
    }
  }
}

async function runCommand(
this:Bobb,
  command: GenericCommand,
  message: Message,
  args: string[],
  updateCooldowns: any,
  _permissions: any
) {
  //  this.botStats.commands++;
  let res = await command.run({
    message,
    args,
    Bobb: this,
    addCD: updateCooldowns
  });
  if (!res) {
    return;
  }
 if(res instanceof this.Return) {
  if(res.Paginate) return;
 // let obj: any = {}
  //if(res.content) obj.content = res.content;
  if(res.embeds){
 //   if(res.embeds.length == 1) obj.embed = res.embeds[0];
//  else throw `Unable to send multiple embeds. Try paginating ${command.props.triggers[0]}`
  }
 // if(res.file) obj.file = res.file;
  if(_.isEmpty(res)) throw `No content to send back for interaction ${command.props.triggers[0]} ?`
//res = obj;
 } else if(typeof res == "string") {
   res = { content: res}
 }else{
  throw `What kind of return for ${command.props.triggers[0]}?`
}
  /*if (res instanceof Object) {
    if (res.reply) {
      return message.channel.send(`<@${message.author.id}>, ${res.content}`);
    }
    delete res["color"]
    res = Object.assign({ color: this.misc.randomColor() }, res);
    if (!permissions.has("EMBED_LINKS")) {
      res = this.misc.unembedify({
        content: res.content,
        file: res.file,
        embed: res
      });
    } else {
      res = {
        content: res.content,
        file: res.file,
        embed: res
      };
      if (Object.keys(res.embed).join(",") === "color,content,file") {
        delete res.embed; // plz fix later
      }
    }
  }*/
console.log(res)
 return await message.channel.send(res).catch( (e: any) => this.loggers.reportError(e, message, command))
}

/*async function reportError(e: any, message: Message, command: GenericCommand) {
  let date = new Date();
  let shardID = message.guild ? message.guild.shard.id : "DM";
  let guildID = message.guild ? message.guild.id : "DM " + message.channel.id;
  await this.botStats.updateOne(
    { _id: "60070be0f12d9e041931de68" },
    { $inc: { errReported: 1 } }
  );
  let msg = await this.misc.errorMessages(e);
  let randNum = Math.floor(Math.random() * 99999);
  const channel = "795760207761768499";
  if (!msg) {
    message.channel.send(
      `Something went wrong lol\nError: \`${
        command.props.triggers[0]
      }.1.${shardID}.${date.getHours()}:${date.getMinutes()}.err${randNum}\``
    );
     this.client.channels.fetch(channel).then(chan => {
      chan.send(
        `**Error: ${e.message}**\nCode: \`err${randNum}\`\nCommand Ran: ${
          command.props.triggers[0]
        }\nDate: ${date.toLocaleTimeString(
          "en-US"
        )}\nSupplied arguments: ${message.content.split(
          / +/g
        )}\nServer ID: ${guildID}\nCluster ${
          this.clusterID
        } | Shard ${shardID}\n\`\`\` ${e.stack} \`\`\``
      );
    });
    this.loggers.log(
      `Command error:\n\tCommand: ${
        command.props.triggers[0]
      }\n\tSupplied arguments: ${message.content.split(
        / +/g
      )}\n\tServer ID: ${guildID}\n\tError: ${e.stack}`,
      "error"
    );
  } else {
    message.channel.send(msg);
    
  }
}*/