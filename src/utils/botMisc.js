import fs from "fs";
import Discord, {
  TextChannel,
  Message,
  Interaction,
  MessageEmbed,
  GuildMember,
  MessageReaction,
  User,
  FetchMemberOptions
} from "discord.js";
import Bobb from "../bot/botClass";
import CryptoJS from 'crypto-js';

const errors = {
  // Voice related errors
  Disconnected: `Discord fucked something up. 😠\n\nTo fix this, you have to got to server settings and change the voice region.\nIf it still doesn't work after that, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`vc1\`.`,

  "Voice connection timeout": `Discord fucked something up. 😠\n\nTo fix this, first try running \`pls stop\`.\nIf that doesn't work, you have to kick me and reinvite me back. I know, it is stupid. 🙄\nIf it still doesn't work after that, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`vc2\`.`,

  "Already encoding": `Something fucked up. 😠\n\nWe're pretty sure this error happens when you're running voice commands too quickly. So slow down 🙄\nIf it's still happening after a while, (<https://discord.gg/Wejhbd4>) and tell support it is error \`vc3\`.`,

  // Currency Errors
  new_val: `Oopsy doopsy, we made a fucky wucky! 😊\n\nThis shouldn't happen to you again, and we are working semi-hard on fixing it. \nIf it DOES happen again, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`econ1\`.`,

  // Image Errors
  "Invalid character in header content": `Well heck, I didn't like some character you used for this command! 😠\n\nIf you used any "not normal" characters for this command, remove those and try again. \nIf it is still happening, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`img1\`.`,

  "socket hang up": `Looks like we just restarted our image server\n\nOnce it is done rebooting, this command will work again. Give it just a few seconds!\nIf it is still happening after multiple minutes, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`img2\`.`,

  // Discord Errors
  "DiscordRESTError [50001]: Missing Access": `Hey! For some reason I don't have permission to run that command. 😠\n\nMake sure you have given me the correct channel perms to run this command. \nIf it is still happening after messing with permissions, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis1\`.`,

  "Request timed out (>15000ms) on POST": `aggggghhhhhhhh discord is having connection issues 😠\n\nAll we can do is wait until they're better. Sorryyyyyy.\nIf it is still happening after a few hours, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis2\`.`,

  "DiscordRESTError [50013]: Missing Permissions": `Hey! For some reason I don't have permission to run that command. 😠\n\nMake sure you have given me the correct channel perms to run this command. \nIf it is still happening after messing with permissions, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis3\`.`,

  "Must be 2000 or fewer in length": `You included too many characters in that.\n\nI am only able to send 2k characters in one message, so please try again with less characters.\nIf it is still happening, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis4\`.`,

  "DiscordHTTPError: 500 INTERNAL SERVER ERROR on POST": `aggggghhhhhhhh discord is having connection issues 😠\n\nAll we can do is wait until they're better. Sorryyyyyy.\nIf it is still happening after a few hours, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis5\`.`,

  // Known Errors
  "Cannot read property 'triggers' of undefined": `This command is currently under maintenance, sorry :(\n\nIt will work if you are spelling the command you are enabling/disabling correctly.\nIf it is still happening, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`bug1\`.`,

  "504 Gateway Timeout": `Look like the service we use for this command is giving us problems :(\n\nAll we can currently do is wait, sadly\nIf it is still happening after a few hours, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`bug2\`.`,

  // Bug Hunting errors
  "DiscordRESTError [10003]: Unknown Channel": `Something broke!\n\nI am currently not sure why this bug is happening, but if you report this bug in the support server, you will get paid for it in meme coins.\nJoin (<https://discord.gg/Wejhbd4>) and tell support it is error \`hunt1\`.`
};

export default (Bobb) => ({
  errorMessages(e) {
    console.log(e)
    return (
      errors[Object.keys(errors).find(error => e.includes(error))] ||
      false
    );
  },
 async loadSlashCommands() {
  let e = await Bobb.client
      .application
      .commands
      .set(Bobb.cmds.map(c=> {
            return c.props.slashCmd
              ? {
                  name: c.props.slashOpts.name.toLowerCase(),
                  description: c.props.slashOpts.description,
                  options: c.props.slashOpts.options
                    ? c.props.slashOpts.options
                    : []
                }
              : false;
          })
          .filter(c => c))
    e.forEach(cmd => Bobb.slashCmds.push(cmd.name));
    console.log(Bobb.slashCmds);
    /*let slashCmds = await this.client.api.applications(this.client.user.id).guilds('699487357400907867').commands.get();
slashCmds.forEach(async cmd => {
  if(!this.cmds.find(nor => (nor.props.slashCmd && nor.props.slashOpts.name) === cmd.name)) await this.utils.cmdReq.delete(`/${cmd.id}`);
}); ONLY IF I EVERY WANT TO DELETE A COMMAND */
 },
  async createAPIMessage(interaction, content) {
    const apiMessage = await Discord.APIMessage.create(
      Bobb.client.channels.resolve(interaction.channelID),
      content
    )
      .resolveData()
      .resolveFiles();
    return { ...apiMessage.data, files: apiMessage.files };
  },
  async sendInitial(interaction) {
    await Bobb.client.api.interactions(
      interaction.id,
      interaction.token
    ).callback.post({
      data: {
        type: 5
      }
    });
  },
  async editMessage(interaction, content) {
    await Bobb.client.api
      .webhooks(Bobb.config.appID, interaction.token)
      .messages("@original")
      .patch({
        data: await this.createAPIMessage(interaction, content)
      });
  },
  async sendMessage(interaction, content) {
    await Bobb.client.api
      .interactions(interaction.id, interaction.token)
      .callback.post({
        data: {
          type: 4,
          data: await this.createAPIMessage(interaction, content)
        }
      });
  },
  
  async parseUser(message, person) {
    await message?.guild?.members?.fetch({ cache: true });
    const idMatcher = /^([0-9]{15,21})$/;
    const userMentionMatcher = /<@!?([0-9]{15,21})>/;
    let posibID = idMatcher.exec(person) || userMentionMatcher.exec(person);
    if (posibID) {
      return await message?.guild?.members?.fetch(posibID[1]);
    } else {
      if (person.slice(-5, -4) === "#") {
        // we have a discrim
        return await message?.guild?.members?.cache?.find(
          member =>
            `${member.user.username}#${member.user.discriminator}` === person ||
            `${member.nickname}#${member.user.discriminator}` === person
        );
      } else {
        return await message.guild?.members?.cache?.find(
          member =>
            member.user.username === person || member.nickname === person
        );
      }
    }
    return undefined;
  }
});

/*const arrows = new Map([
	['⬅️', '%E2%AC%85%EF%B8%8F%20'],
	['➡️', '%E2%9E%A1%EF%B8%8F%20'],
	['⏩', '%E2%8F%A9'],
	['⏪', '%E2%8F%AA']
]);
*/
