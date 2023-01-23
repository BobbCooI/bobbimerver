import {
  Snowflake,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import Bobb from "../../src/bot/botClass";
import { executeArgs } from "./discordThings";
import config from "../../src/config.json";
import { COMMAND_CATEGORIES, COMMAND_GROUP_NAMES } from "lib/utils/constants";

interface slashOptions {
  isSubCommand?: boolean;
  groupName?: COMMAND_GROUP_NAMES;
  commandOptions: SlashCommandBuilder | SlashCommandSubcommandBuilder;
}
//probably gonna make slashOPtions all JSON then only turn it into a builder when i upload it to disocrd.
// that way, i can implement subcommands by getting all commands, looking at the group its in then create
// a builder from there
export class Command {
  name: string;
  description: string;
  restrictTo: "guild" | "dm" | "all";
  slashOptions: slashOptions;
  declare Bobb: Bobb;
  category: COMMAND_CATEGORIES;

  enabled?: boolean;
  guilds?: Snowflake[];
  ephemeral?: boolean;
  premium?: boolean;
  cooldown?: number;

  fn: any;
  ownerOnly?: boolean;
  bypassVerification?: boolean;

  constructor(attributes: CommandOptions, fn: any) {

    this.name = attributes.slashOptions?.isSubCommand
      ? attributes.slashOptions.groupName +
        attributes.slashOptions.commandOptions.name
      : attributes.slashOptions.commandOptions.name;
      
    this.description = attributes.slashOptions.commandOptions.name;
    this.category = attributes.category;
    this.restrictTo = attributes.restrictTo;
    this.slashOptions = attributes.slashOptions;
    this.guilds = attributes.guilds;

    this.enabled = attributes.enabled ?? true;
    if (this.ownerOnly) {
      this.guilds = [config.devGuildID];
    }

    this.ephemeral = attributes.ephemeral ?? false;
    this.premium = attributes.premium ?? false;
    this.cooldown = attributes.cooldown ?? 0;
    this.fn = fn;
    this.ownerOnly = attributes.ownerOnly ?? false;
    this.bypassVerification = attributes.bypassVerification || false;
  }

  async init(): Promise<any> {}

  async run({ slashInt, addCD }: executeArgs) {
    /*  if (this.props.missingArgs && !args[0]) {
      return this.props.missingArgs;
    }
    if (this.props.minArgs && args.length < this.props.minArgs) {
      return this.props.missingArgs;
    }*/

    // Here can be middleware code such as args length checking ex. above ^

    return this.fn({ slashInt, addCD });
  }

  /*async registerSlashCommand(client: extClient, guildID?: Snowflake) {
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
  }*/
}

export interface CommandOptions {
  restrictTo: "guild" | "dm" | "all";
  enabled?: boolean;
  slashOptions: slashOptions;
  category: COMMAND_CATEGORIES;

  guilds?: Snowflake[];
  ephemeral?: boolean;
  premium?: boolean;
  cooldown?: number;
  bypassVerification?: boolean;
  ownerOnly?: boolean;
}
