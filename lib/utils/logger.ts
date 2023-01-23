import Discord, { EmbedBuilder, Message, TextChannel } from 'discord.js';
import Bobb from '@src/bot/botClass';
import { Command } from "../bot/Command"
import { randomNumber } from './utils';
export default (Bobb: Bobb) => ({
  async logReady(message: string, name: string = 'log'): Promise<void> {
    const date = Date().toString().split(' ').slice(1, 5).join(' ');
    //console.log('logger', this)

    let chan = await Bobb.client.channels.fetch('793650413865009152') as TextChannel

    let embed = new Discord.EmbedBuilder()
      .setTitle(name)
      .addFields({name: `[${date}]`, value: message, inline: false})
      .setTimestamp()
      .setColor([255, 102, 0]);
    await chan.send({ embeds: [embed] }).catch((e: any): any => console.log("message:", message, "\nerror:", e.message));
  },
  async log(message: string, name: string = 'log'): Promise<void> {
    const date = Date().toString().split(' ').slice(1, 5).join(' ');
    //console.log('logger', this)
    let chan = await Bobb.client.channels.fetch('795760207761768499') as TextChannel;
    let msg = `${name}
  [${date}]
  ${message}`
    await chan.send({ content: msg }).catch((e: any): any => console.log("message:", message, "\nerror:", e.message));
  },
  async cacheMessage(embed: EmbedBuilder): Promise<void> {
    let cacheChannel = await Bobb.client.channels.fetch('847249762453159937') as TextChannel;

    await cacheChannel.send({ embeds: [embed] }).catch((e: any): any => console.log("error caching a message..", e, "embed:", embed));
  },
  async reportError(e: any, message: Message, command: Command): Promise<void> {
    let date = new Date();
    let shardID = message.guild ? message.guild.shard.id : "DM";
    let guildID = message.guild ? message.guild.id : "DM " + message.channel.id;
    const commandName = command.name
    await Bobb.botStats.updateOne(
      { _id: "60070be0f12d9e041931de68" },
      { $inc: { errReported: 1 } }
    );
    let msg = await Bobb.constants.errorMessages(e.toString());
    let randNum = randomNumber(1, 99999);
    const channel = "795760207761768499";
    if (!msg) {
      message.channel.send(
        `Something went wrong lol\nError: \`${commandName}.1.${shardID}.${date.getHours()}:${date.getMinutes()}.err${randNum}\``
      );
      const errChan = await Bobb.client.channels.fetch(channel) as TextChannel;
      errChan.send(
        `**Error: ${e.message}**\nCode: \`err${randNum}\`\nCommand Ran: ${commandName}\nDate: ${date.toLocaleTimeString(
          "en-US"
        )}\nSupplied arguments: ${message.content.split(
          / +/g
        )}\nServer ID: ${guildID}\nCluster "idk"
         | Shard ${shardID}\n\`\`\` ${e.stack || e} \`\`\``
      );
      await exports.default(Bobb).log(
        `Command error:\n\tCommand: ${commandName}\n\tSupplied arguments: ${message.content.split(
          / +/g
        )}\n\tServer ID: ${guildID}\n\tError: ${e.stack}`,
        "error"
      );
    } else {
      message.channel.send(msg);
    }
  }
})


