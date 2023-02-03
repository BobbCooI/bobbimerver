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
    // Here can be middleware code if ever needed
    return this.fn({ slashInt, addCD });
  }
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
