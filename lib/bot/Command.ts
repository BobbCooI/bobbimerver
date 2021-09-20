import {
  CommandOptions as AkairoCommandOptions,
  Command as AkairoCommand
} from "discord-akairo";
import {
  ApplicationCommandOptionData,
  ApplicationCommandData,
  DiscordAPIError,
  Permissions,
  Snowflake,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord-api-types";
import Bobb, { extClient } from "../../src/bot/botClass"
import { executeArgs, ArgumentOptions } from "./botTypes";

// most code inspired from https://github.com/FireDiscordBot/bot/blob/master/lib/util/command.ts . ty

const slashCommandTypeMappings: { [index: string]: any[] } = {
  SUB_COMMAND: [],
  SUB_COMMAND_GROUP: [],
  STRING: [
    "string",
    "codeblock",
    "command",
    "listener",
    "module",
    "message",
  ],
  INTEGER: ["number"],
  BOOLEAN: ["boolean"],
  USER: [
    "user",
    "member",
    "user|member",
    "user|member|snowflake",
    "userSilent",
    "memberSilent",
  ],
  CHANNEL: [
    "textChannel",
    "voiceChannel",
    "textChannelSilent",
    "category",
    "categorySilent",
    "guildChannel",
    "guildChannelSilent",
  ],
  ROLE: ["role", "roleSilent"],
  MENTIONABLE: ["member|role"],
};

export class Command extends AkairoCommand {
  [index: string]: any;
  attributes: CommandOptions;
  args?: ArgumentOptions[];
  declare channel?: "guild" | "dm";
  enableSlashCommand: boolean;
  declare Bobb: Bobb;
  guilds: Snowflake[];
  ephemeral: boolean;
  premium: boolean;
  fn: any;
  hidden: boolean;
  bypassVerification: boolean;
  constructor(attributes: CommandOptions, fn: any) {
    const id = attributes.name
    if (!attributes?.aliases?.length) attributes.aliases = [attributes.name];
    else attributes?.aliases?.push(attributes.name);
    if (!attributes?.clientPermissions)
      attributes.clientPermissions = [
        Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
        Permissions.FLAGS.SEND_MESSAGES,
        Permissions.FLAGS.ADD_REACTIONS,
      ];
    if (
      attributes.args instanceof Array &&
      attributes.args.length == 1 &&
      !attributes.args[0].match
    )
      attributes.args[0].match = "rest";
    if (attributes.args instanceof Array)
      attributes.args.forEach((arg) => {
        if (!arg.readableType && arg.type) {
          if (arg.type instanceof Array) arg.readableType = arg.type.join("|");
          else arg.readableType = arg.type.toString();
          if (arg.readableType.toLowerCase().endsWith("silent"))
            arg.readableType = arg.readableType.slice(
              0,
              arg.readableType.length - 6
            );
          if (
            ["string", "snowflake", "boolean", "number"].includes(
              arg.readableType
            )
          )
            arg.readableType = arg.id;
        } else if (arg.flag && arg.match == "flag")
          arg.readableType = "boolean";
        else if (arg.flag && arg.match == "option" && !arg.type)
          arg.type = arg.readableType = "string";
        if (!arg.slashCommandType) {
          arg.slashCommandType =
            arg.readableType?.split("|")[0] ?? arg.type?.toString();
        }

        arg.readableType = arg.readableType?.toLowerCase();
      });
    if (!attributes.restrictTo) attributes.channel = "guild";
    else if (attributes.restrictTo != "all") attributes.channel = attributes.restrictTo;

    super(id, attributes);
    this.enableSlashCommand = attributes.enableSlashCommand || false;
    this.ephemeral = attributes.ephemeral || false;
    this.premium = attributes.premium || false;
    this.guilds = attributes.guilds || [];
    this.args = attributes.args;
    this.fn = fn;
    this.attributes = attributes;
    this.bypassVerification = attributes.bypassVerification || false
  }

  async init(): Promise<any> { }

  async run({ Swessage, addCD }: executeArgs) {
    /*  if (this.props.missingArgs && !args[0]) {
      return this.props.missingArgs;
    }
    if (this.props.minArgs && args.length < this.props.minArgs) {
      return this.props.missingArgs;
    }*/

    // Here can be middleware code such as args length checking ex. above ^

    return this.fn({ Swessage, addCD });
  }
  async unload(): Promise<any> { }

  getArgumentsClean() {
    return typeof this.args != "undefined" && Array.isArray(this.args)
      ? this.args.map((argument) => {
        if (argument.required) {
          if (argument.flag)
            return argument.type
              ? `<${argument.flag} ${argument.readableType}>`
              : `<${argument.flag}>`;
          else return `<${argument.readableType}>`;
        } else {
          if (argument.flag)
            return argument.type
              ? `[<${argument.flag} ${argument.readableType}>]`
              : `[<${argument.flag}>]`;
          else return `[<${argument.readableType}>]`;
        }
      })
      : [];
  }

  getSlashCommandJSON(id?: string) {
    let data: ApplicationCommandData & { id?: string; } = {
      name: this.id,
      description: this.description || "No Description Provided",
      type: "CHAT_INPUT",
      defaultPermission: true,
    };
    if (id) data.id = id;

    if (this.args?.length)
      //@ts-ignore
      data["options"] = [
        ...(this.args as ArgumentOptions[])
          .filter((arg) => arg.readableType)
          .map((arg) => this.getSlashCommandOption(arg)),
      ];

    return data;
  }

  getSlashCommandOption(argument: ArgumentOptions) {
    const type =
      (Object.keys(slashCommandTypeMappings).find((type) =>
        slashCommandTypeMappings[type].includes(argument.type)
      ) as unknown as ApplicationCommandOptionType) || "STRING";
    let options: ApplicationCommandOptionData = {
      //@ts-ignore
      type: type as keyof typeof ApplicationCommandOptionType,
      name: (argument.slashCommandType ? argument.slashCommandType : argument.readableType?.split("|")[0])!
        .replace("Silent", "")
        .toLowerCase(),
      description: argument.description || "No Description Provided",
      required: argument.required,
    };

    if (
      argument.slashCommandOptions ||
      (argument.type instanceof Array &&
        argument.type.every((value: any) => typeof value == "string"))
    ) {
      let choices: { name: string; value: string }[] = [];
      for (const type of (argument.slashCommandOptions ||
        argument.type) as string[]) {
        choices.push({
          name: type.toLowerCase(),
          value: type,
        });
      }
      //@ts-ignore
      options["choices"] = choices;
    } else if (argument.flag && argument.match == "flag") {
      options["name"] = argument.id!.toLowerCase();
      options["type"] = "BOOLEAN";
    } else if (argument.flag && argument.match == "option") {
      options["name"] = argument.id!.toLowerCase();
    }
    return options;
  }



  async registerSlashCommand(client: extClient, guildID?: Snowflake) {
    const commandData = this.getSlashCommandJSON();
    let commands = [];
    if (!this.guilds.length) {
      const command = await client.application!.commands
        .create(commandData, guildID || "")
        .catch((e: Error) => e);
      if (command instanceof DiscordAPIError)
        command.code != 30032 &&
          console.warn(
            `[Commands] Failed to register slash command for ${this.props.name}`,
            command
          );
      else if (command instanceof Error)
        console.warn(
          `[Commands] Failed to register slash command for ${this.props.name}`,
          command.stack
        );
      else if (command.id) commands.push(command);
    } else {
      for (const guildId of this.guilds) {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) continue;
        const command = await guild.commands
          .create(commandData)
          .catch((e: Error) => e);
        if (command instanceof DiscordAPIError)
          command.httpStatus != 403 &&
            command.code != 50001 &&
            console.warn(
              `[Commands] Failed to register slash command for ${this.props.name} in guild ${guild}`,
              command
            );
        else if (command instanceof Error)
          console.warn(
            `[Commands] Failed to register slash command for ${this.props.name} in guild ${guild}`,
            command.stack
          );
        else if (command.id) commands.push(command);
      }
    }
    return commands;
  }

  get props() {
    return Object.assign(
      {
        usage: "{command}",
        cooldown: 1000,
        donorCD: 500,
        isNSFW: false,
        ownerOnly: false,
        dmOnly: false,
        bypass: false,
        slashCmd: false,
        cooldownMessage: ""
      },
      this.attributes,
      { perms: ["SEND_MESSAGES"].concat(this.attributes.permissions || []) }
    );
  }
}


export interface CommandOptions extends AkairoCommandOptions {
  name: string;
  description: string;
  args?: ArgumentOptions[];
  restrictTo?: "guild" | "dm" | "all";
  enableSlashCommand?: boolean;
  permissions?: string[]
  guilds?: Snowflake[];
  ephemeral?: boolean;
  premium?: boolean;
  cooldown?: number;
  hidden?: boolean;
  bypassVerification?: boolean;
}