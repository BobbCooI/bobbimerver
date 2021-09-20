const idMatcher = /^([0-9]{15,21})$/;
const userMentionMatcher = /<@!?([0-9]{15,21})>/;
const channelMentionMatcher = /<#([0-9]{15,21})>/;
const roleMentionMatcher = /<@&([0-9]{15,21})>/;
import {
  Message,
  User,
  Role,
  Client,
  Channel,
  GuildChannel,
  Snowflake,
  GuildMember
} from "discord.js";

export default class ArgManager {
  message: Message;
  args: Array<string>;
  bot: Client;
  constructor(message: Message, args: Array<string>) {
    /** @type {Message} The message */
    this.message = message;
    /** @type {Array<String>} The raw sliced arguments */
    this.args = args;
    /** @type {Client} The discord client instance */
    this.bot = message.client;
  }

  /**
   * Resolves a user using the next argument in the list or all remaining arguments
   * @param {Boolean} consumeRest Whether to use the rest of the arguments to resolve the user or not
   * @param {Boolean} consumeOnFail Whether to consume the arguments or preserve them if the args weren't resolved
   * @return {Null|User} Null if the argument couldn't be resolved, otherwise the user object
   */
  resolveUser(
    consumeRest: boolean = false,
    consumeOnFail: boolean = true
  ): null | User {
    // TODO: Quotation support
    const args = consumeRest
      ? this.args.splice(0).join(" ")
      : this.args.shift(); // We use splice to ensure the args array is emptied

    if (!args) {
      return null; // We have nothing to resolve a user with
    }

    const idMatch = idMatcher.exec(args) || userMentionMatcher.exec(args);
    let ret = null;

    if (idMatch) {
      // Found the user by mention or raw ID
      ret = (this.message.channel as GuildChannel).guild.members.cache.get(
        idMatch[1] as Snowflake
      );
    } else {
      // Find the user by their username (and discrim?)
      if (args.length > 5 && args.slice(-5, -4) === "#") {
        // we have a discrim
        ret = (this.message.channel as GuildChannel).guild.members.cache.find(
          (member: GuildMember) =>
            `${member.user.username}#${member.user.discriminator}` === args ||
            `${member.nickname}#${member.user.discriminator}` === args
        );
      } else {
        ret = (this.message.channel as GuildChannel).guild.members.cache.find(
          (member: GuildMember) => member.user.username === args || member.nickname === args
        );
      }
    }

    if (!ret && !consumeOnFail) {
      this.args.unshift(...args.split(" "));
    }

    return ret ? ret.user : null;
  }

  /**
   * Resolves a channel using the next argument in the list or all remaining arguments
   * @param {Boolean} consumeRest Whether to use the rest of the arguments to resolve the channel or not
   * @return {Null|TextChannel|VoiceChannel} Null if the argument couldn't be resolved, otherwise the channel object
   */
  resolveChannel(
    consumeRest: boolean = false,
    consumeOnFail: boolean = true
  ): null | Channel | GuildChannel {
    if (this.message.mentions.channels?.first()) return this.message.mentions.channels.first()!
    const args = consumeRest
      ? this.args.splice(0).join(" ")
      : this.args.shift();

    if (!args) {
      return null; // We have nothing to resolve a user with
    }

    const idMatch = idMatcher.exec(args) || channelMentionMatcher.exec(args);
    let ret = null;

    if (idMatch) {
      ret = this.bot.channels.cache.get(idMatch[1] as Snowflake);
      if (ret?.type === "GUILD_CATEGORY") {
        ret = null; // If the channel is a category, don't pick it up
      }
    } else {
      if (!(this.message.channel as GuildChannel)?.guild) {
        ret = null; // Only allow name-lookup for channels locally due to the performance impact this would have for searching lots of guilds
      } else {
        ret = (this.message.channel as GuildChannel).guild.channels.cache.find(
          (channel: any) => channel.name === args && channel.type !== "category"
        );
      }
    }

    if (!ret && !consumeOnFail) {
      this.args.unshift(...args.split(" "));
    }

    return ret || null;
  }

  /**
   * Resolves a role using the next argument in the list or all remaining arguments
   * @param {Boolean} consumeRest Whether to use the rest of the arguments to resolve the role or not
   * @return {Null|Role} Null if the argument couldn't be resolved, otherwise the role object
   */
  resolveRole(consumeRest: boolean = false): Role | null {
    const args = consumeRest
      ? this.args.splice(0).join(" ")
      : this.args.shift();

    if (!(this.message.channel as GuildChannel).guild || !args) {
      return null;
    }

    const idMatch = idMatcher.exec(args) || roleMentionMatcher.exec(args);

    if (idMatch) {
      return (this.message.channel as GuildChannel).guild.roles.cache.get(idMatch[1] as Snowflake) || null;
    } else {
      return (this.message.channel as GuildChannel).guild.roles.cache.find(
        (role: Role) => role.name === args
      ) || null;
    }
  }

  /**
   * Resolves multiple users by consuming the remaining arguments
   * @return {Array<User>} An array of user objects. Could be empty.
   */
  resolveUsers(): Array<User> {
    const resolved = [];

    let user;

    while ((user = this.resolveUser(false)) !== null) {
      resolved.push(user);
    }

    return resolved;
  }

  /**
   * Returns the next word(s) in the argument list
   * @param {Boolean} consumeRest Whether to return the remaining arguments or a single argument
   * @return {Null|String} Null if the arg list is empty, otherwise the arguments
   */
  nextArgument(consumeRest: boolean = false): undefined | string {
    return consumeRest ? this.args.splice(0).join(" ") : this.args.shift();
  }

  /**
   * Returns the arguments with cleaned mentions
   * @param {Boolean} consumeRest Whether to use the remaining arguments or a single argument
   * @return {Null|String} Null if the arg list is empty, otherwise the cleaned arguments
   */
  cleanContent(consumeRest: boolean = false): null | undefined | string {
    let args = consumeRest ? this.args.splice(0).join(" ") : this.args.shift();

    if (!args) {
      return null;
    }

    let match;

    while ((match = userMentionMatcher.exec(args)) !== null) {
      // Clean user mentions
      const user: GuildMember | User | undefined = this.message.guild
        ? this.message?.guild.members.cache.get(match[1] as Snowflake)
        : this.bot.users.cache.get(match[1] as Snowflake)

      const formatted = user
        ? `@${(user as GuildMember).nickname || (user as User).username}`
        : "@deleted-user";
      args = args.replace(match[0], formatted);
    }

    while ((match = channelMentionMatcher.exec(args)) !== null) {
      // Clean channel mentions
      const channel = (this.message.channel as GuildChannel).guild.channels.cache.get(match[1] as Snowflake);
      const formatted = channel ? `#${channel.name}` : "#deleted-channel";
      args = args.replace(match[0], formatted);
    }

    while ((match = roleMentionMatcher.exec(args)) !== null) {
      // Clean role mentions
      const role = (this.message.channel as GuildChannel).guild.roles.cache.get(match[1] as Snowflake);
      const formatted = role ? `@${role.name}` : "@deleted-role";
      args = args.replace(match[0] as Snowflake, formatted);
    }

    args = args
      .replace("@everyone", "@\u200Beveryone")
      .replace("@here", "@\u200Bhere"); // Clean everyone/here mentions

    return args;
  }

  /**
   * Check if the message does not contain any args
   * @type {Boolean}
   */
  get isEmpty() {
    return !this.args[0];
  }

  /**
   * Get the total length of the args
   * @type {Number}
   */
  get textLength() {
    return this.args.join(" ").length;
  }

  /**
   * Get the argument at the given index
   * @param {Number} [index=0] - The index, defaults to `0`
   * @returns {String} The argument
   */
  getArgument(index: number = 0): string {
    return this.args[index];
  }

  /**
   * Returns the merged arguments
   * @returns {String} The arguments
   */
  gather(): string {
    return this.args.join(" ");
  }

  /**
   * Drops the argument at the given index
   * @param {Number} index - The index of the argument to drop
   * @returns {void}
   */
  drop(index: number) {
    this.args.splice(index, 1);
  }
}
