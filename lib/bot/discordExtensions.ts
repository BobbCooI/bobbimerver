import Bobb from '../../src/bot/botClass';
import {
  Collection,
  CommandInteraction,
  Message,
  MessageAttachment,
  Snowflake,
  MessageMentions,
  User,
  GuildChannel,
  DMChannel,
  Guild,
  GuildMember,
  CommandInteractionOptionResolver,
  CommandInteractionOption,
  MessagePayload,
  WebhookEditMessageOptions
  // MessageOptions
} from 'discord.js';
import { RawMessageData } from "discord.js/typings/rawDataTypes";
import { Command } from './Command';
import { ArgumentType } from 'discord-akairo';
import { mOrI } from "./botTypes"
export type getArguments = Map<string, { name: string; type: ArgumentType; value?: string | number | boolean; user?: User }>;
export class Swessage extends Message {
  [index: string]: any;
  Bobb: Bobb;
  cleanArgs: string[];
  args?: getArguments;
  declare client: Bobb["client"];
  command?: Command;
  cmsgType: mOrI;
  constructor(Bobb: Bobb, data: RawMessageData, type: mOrI) {
    super(Bobb.client, data);
    this.cmsgType = type;
    this.Bobb = Bobb
    this.args = new Map();
    this.cleanArgs = data.content.slice(2).split(/ +/g);
  }
  async send(payload: string | MessagePayload | WebhookEditMessageOptions) {
    let m: Message;
    const channel = this.channel || await this.client.channels.fetch(this.channelId);
    if (this.cmsgType == "message") {
      m = await channel.send(payload)
    } else if (this.cmsgType == "interaction") {
      //@ts-ignore from slashMessage
      m = this.slashCommand.editReply(payload)
    } else throw new Error("Unknown message send destination")
    return m
  }

}

export class slashMessage {
  attachments: Collection<string, MessageAttachment>;
  id: Snowflake
  slashCommand: CommandInteraction;
  message: Swessage;
  mentions: MessageMentions;
  latestResponse: Snowflake;
  channel: DMChannel | GuildChannel;
  member?: GuildMember;
  guild?: Guild;
  command: Command;
  author: User;
  webhookId = null;
  content: string;
  args: CommandInteractionOptionResolver;
  Bobb: Bobb;
  readonly cmsgType: mOrI;

  declare client: Bobb["client"]

  constructor(Bobb: Bobb, interaction: CommandInteraction, type: mOrI) {
    this.Bobb = Bobb;
    this.id = interaction.id
    this.cmsgType = type;

    this.slashCommand = interaction;
    if (interaction.options.data.find((opt: CommandInteractionOption) => opt.type == "SUB_COMMAND")) {
      interaction.commandName = `${interaction.commandName
        }-${interaction.options.getSubcommand()}`;
      interaction.options = new CommandInteractionOptionResolver(
        Bobb.client,
        interaction.options.data[0].options ?? []
      );
    }
    this.guild = Bobb.client.guilds.cache.get(interaction.guildId!);
    this.command = this.Bobb.commandHandler.getCommand(interaction.commandName) as Command;
    // @ts-ignore
    this.mentions = new MessageMentions(this, [], [], false);
    this.attachments = new Collection();
    this.author = interaction.user;
    if (this.guild) {
      this.member = interaction.member as GuildMember
    }
    this.args = interaction.options;
    this.latestResponse = "@original" as Snowflake;
    if (!this.guild) {
      // This will happen if a guild authorizes w/applications.commands only
      // or if a slash command is invoked in DMs (discord/discord-api-docs #2568)
      //  console.log(interaction)
      this.channel = interaction.channel as GuildChannel

      return this;
    }
    this.channel = interaction.channel as GuildChannel
  }
  async send(payload: string | MessagePayload | WebhookEditMessageOptions) {
    let m: Message;
    if (this.cmsgType == "message") {
      m = await (this.channel as DMChannel).send(payload)
    } else if (this.cmsgType == "interaction") {
      //@ts-ignore from slashMessage
      m = this.slashCommand.editReply(payload)
    } else throw new Error("Unknown message send destination")
    return m
  }

}

