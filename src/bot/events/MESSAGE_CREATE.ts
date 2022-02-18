import { Command } from "../../../lib/bot/Command";
import { Swessage } from "../../../lib/bot/discordExtensions";
import _ from "lodash"
import { constructHelp, handleRes } from "../../../lib/utils/utils";
import { ArgumentType as AkairoArgumentType } from "discord-akairo";
//import { Message, MessageOptions, MessagePayload } from "discord.js";
import { RawMessageData } from "discord.js/typings/rawDataTypes";
import Bobb from "../botClass"
import { options } from "../../config.json"
import { GuildChannel, Message, MessageEmbed, Permissions } from "discord.js";
//import { APIMessage } from "discord-api-types";
exports.handle = async function (rawMsg: RawMessageData): Promise<Message | undefined | null | void> {

  const message = new Swessage(this, rawMsg, "message")
  if (message.author.bot) return;
  await this.botStats.findOneAndUpdate({ _id: "60070be0f12d9e041931de68" }, { $inc: { messages: 1 } });

  /* Parse for prefix */
  const selfMember = message.guild
    ? message.guild.me  //@ts-ignore
    : { nickname: false, id: options.botID };
  let mention = `<@!${selfMember!.id}>` //`<@${selfMember!.nickname ? "!" : ""}${selfMember?.id}>`;
  const wasMentioned = message.content.startsWith(mention);
  if (message.content.slice(mention.length)[0] === " ") mention = mention += " ";
  const triggerLength = (wasMentioned ? mention : options.prefix).length;
  if (
    !message.content.toLowerCase().startsWith(options.prefix) &&
    !wasMentioned
  ) return;
  /* ------------------- */

  let cleanArgs: string[] = message.content.slice(triggerLength).split(/ +/g);
  let possibleCommand: null | string = cleanArgs[0];
  cleanArgs = cleanArgs.slice(1)
  message.cleanArgs = cleanArgs
  if (!possibleCommand || !this.cmds.find((c: Command) => c.attributes.name.includes(`${possibleCommand?.toLowerCase()}`))) {
    if (  //@ts-ignore
      message?.mentions?.has(this?.client?.user?.id || options.botID) &&
      message.content.toLowerCase().includes("hello")
    ) await message.channel.send(`Hello, ${message.author.username}. My prefix is \`${options.prefix}\`. Example: \`${options.prefix}ping\``);
    return;
  }

  const command: Command = this.cmds.find((c: Command) => c.attributes.name.includes(possibleCommand!.toLowerCase()));

  /* Make the message arguments */
  message.args = new Map()
  if (command.args) {
    for (let [index, arg] of command.args!.entries()) {
      console.log(index,arg)
      let elArg = false
        if (arg.id && arg.type == "string") {
          if (!message.cleanArgs[index] && arg.required) return message.channel.send({ embeds: [constructHelp(command)], content: "Wrong usage!" })
          message.args.set(arg.id!,
            {
              name: arg.id!,
              type: arg.type as AkairoArgumentType || "string",
              value: command.args.length === 1 ? message.cleanArgs.join(" ") : message.cleanArgs[index]
            });
            elArg = true;
        } else if (arg.id && arg.type == 'user') {
          const person = (message.mentions.members?.first())?.user || message.mentions.users.first()
          if (person) {
            message.args.set(arg.id!,
            {
              name: arg.id!,
              type: arg.type as AkairoArgumentType || "string",
              user: person
            });
            elArg = true
           } else {
              if (arg.required) return message.channel.send({ embeds: [constructHelp(command)], content: "Wrong usage! Please mention a user" })
            }
        } else if (arg.id && arg.type == 'number') {
          if (!message.cleanArgs[index] && arg.required) return message.channel.send({ embeds: [constructHelp(command)], content: "Wrong usage!" })
          
          const numero:number = parseInt(message.cleanArgs[index]);
          if(isNaN(numero)) return message.channel.send({ embeds: [constructHelp(command)], content: "Wrong usage! Number argument incorrect" })
         
          message.args.set(arg.id!,
            {
              name: arg.id!,
              type: arg.type as AkairoArgumentType || "string",
              value: numero
            });
            elArg = true
        } else {
          if(!elArg && arg.required) {
            message.channel.send({ content: `Incorrect usage. Argument ${arg.id} is missing.`, embeds: [constructHelp(command)] });
          return;
          }
        }
    
      //if (arg.id) message.args.set(arg.id!, { name: arg.id, type: arg.type as AkairoArgumentType || "string", value: message.cleanArgs[index] })
    }
  }
  /* ---------------------- */


  message.command = command;

  await this.db.updateStats.call(this, message, command);
  const isInCooldown = await this.db.checkCooldowns.call(this, message, command);
  if (isInCooldown) {
    return;
  }
  const addCD = () => this.db.updateCooldowns(command.props.name, message.author.id);
  let permissions: any = new Permissions().add([Permissions.FLAGS.SEND_MESSAGES]);
  if (message.guild) {
    permissions = (message.channel as GuildChannel)?.permissionsFor(message.guild.me!);
  }
  if (command.props.perms.some((perm: any) => !permissions.has(perm))) {
    checkPerms.call(this, command, permissions, message);
  }

  /* Handle actual function/command calling */
  // @ts-ignore
  
  let res = await command.run({ Swessage: message, addCD })

  return handleRes(res, command, "message", message)

}



function checkPerms(this: Bobb, command: Command, permissions: any, message: Swessage): void {
  const neededPerms = command.props.perms.filter(
    (perm: any) => !permissions.has(perm)
  );
  if (permissions.has(Permissions.FLAGS.SEND_MESSAGES)) {
    if (permissions.has(Permissions.FLAGS.EMBED_LINKS)) {
      message.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle("oh no!")
            .setDescription(`You need to add **${neededPerms.length > 1 ? neededPerms.join(", ") : neededPerms
              }** to use this command!\nGo to **Server settings => Roles => commandev** to change this!`)
            .setColor(this.utils.randomColor())
            .setFooter("If it still doesn't work, check channel permissions too!")
        ]
      });
    } else {
      message.channel.send(
        `You need to add **${neededPerms.join(
          ", "
        )}** to use this command!\n\nGo to **Server settings => Roles => commandev** to change this!`
      );
    }
  }
}