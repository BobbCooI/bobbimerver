import Bobb from "@src/bot/botClass";
import fs from "fs";
import path from "path";
import { Command } from "./Command";
import Discord, {
  ChatInputCommandInteraction,
  OAuth2Guild,
  REST,
  Routes,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  Snowflake,
} from "discord.js";
import {
  COMMAND_CATEGORIES,
  COMMAND_GROUP_DESCRIPTIONS,
  COMMAND_GROUP_NAMES,
  OWNER_ONLY_COMMANDS,
} from "@lib/utils/constants";

export default class CommandHandler {
  declare Bobb: Bobb;

  constructor(Bobb: Bobb) {
    this.Bobb = Bobb;
  }

  /**
   * Populates "slashCommands" on the client and filters out those that aren't enabled
   *
   * @return {Promise<void>}
   */
  async populateCommands() {
    const categories = fs.readdirSync(
      path.join(__dirname, "..", "..", "src", "bot", "commands")
    );
    await this.Bobb.utils.asyncForEach(
      categories,
      async (categoryPath: string) => {
        let category = (
          await import(
            path.join(
              __dirname,
              "..",
              "..",
              "src",
              "bot",
              "commands",
              categoryPath
            )
          )
        ).default; //.catch((e: any) => console.log(e))).default;

        await this.Bobb.utils.asyncForEach(
          category.commands,
          async (commandImport: any) => {
            commandImport = await commandImport;
            const elCmd: Command = commandImport.default;
            if (!elCmd.enabled) return;
            this.Bobb.slashCommands.push(elCmd);
          }
        );
      }
    );
  }

  /**
   * Helper function to simply delete all interactions of the application
   *
   * @return {Promise<void>}
   */
  async removeAllInteractions() {
    const clientId = this.Bobb.client.user!.id;
    const BOT_REST = new REST({ version: "10" }).setToken(
      this.Bobb.config.botToken
    );

    //Clean all global commands
    const allSlashCommands = (await BOT_REST.get(
      Routes.applicationCommands(clientId)
    )) as Discord.RESTGetAPIApplicationCommandsResult;

    if (allSlashCommands.length) {
      await BOT_REST.put(Routes.applicationCommands(clientId), { body: [] });
      console.log(
        `SUCCESS [ cleaned all global slash commands. [ ${allSlashCommands.map(
          (cmd) => cmd.name
        )} ] ]`
      );
    }

    //Clean all guild commands
    const guilds = await this.Bobb.client.guilds.fetch();

    await this.Bobb.utils.asyncForEach(
      guilds.map((guild: OAuth2Guild) => guild.id),
      async (id: Snowflake) =>
        await BOT_REST.put(Routes.applicationGuildCommands(clientId, id), {
          body: [],
        })
    );

    console.log("SUCCESS [ cleaned all Guild Commands ]");
  }

  /**
   * Takes the ready ata from {convertCommandsToJSON} and uploads it to the API
   * Filters out those that are guild-only vs global
   *
   * @param {Array<Discord.RESTPostAPIChatInputApplicationCommandsJSONBody>} jsonData The JSON slash command data ready to upload
   * @return {Promise<void>}
   */
  async loadInteractions(
    jsonData: Discord.RESTPostAPIChatInputApplicationCommandsJSONBody[]
  ): Promise<void> {
    if (!this.Bobb.slashCommands) new Error("NO SLASH COMMANDS TO UPLOAD..");

    const clientId = this.Bobb.client.user!.id;
    const BOT_REST = new REST({ version: "10" }).setToken(
      this.Bobb.config.botToken
    );
    const ownerOnlys = [];

    for (let i = 0; i < jsonData.length; i++) {
      if (OWNER_ONLY_COMMANDS.includes(jsonData[i].name)) {
        ownerOnlys.push(jsonData[i]);
        jsonData.splice(i, 1);
      }
    }
    const globalRes = await BOT_REST.put(Routes.applicationCommands(clientId), {
      body: jsonData,
    });
    const guildRes = await BOT_REST.put(
      Routes.applicationGuildCommands(clientId, this.Bobb.config.devGuildID),
      { body: ownerOnlys }
    );
    console.log(
      `SUCCESS [ uploaded all slash commands globally. names: ${(
        globalRes as Discord.RESTPutAPIApplicationCommandsResult
      ).map((r) => r.name)}]`,
      `\nSUCCESS [ uploaded guild commands in ${
        this.Bobb.config.devGuildID
      } . names: ${(
        guildRes as Discord.RESTPutAPIApplicationCommandsResult
      ).map((r) => r.name)}]`
    );
  }

  /**
   * Transforms populated slashCommands into JSON form.
   * Compiles the commands and subCommands to be ready-to-upload to the discord API
   *
   * @param {Array<COMMAND_CATEGORIES>} categories The categories wanted to be uploaded.
   * @return {Array<Discord.RESTPostAPIChatInputApplicationCommandsJSONBody>} The body of all the slash commands ready-to-upload
   */
  convertCommandsToJSON(
    categories: Array<COMMAND_CATEGORIES>
  ): Discord.RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    let ret: Discord.RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    // this should be the type but typescript complain too much
    //type groupsType = {[name in COMMAND_GROUP_NAMES]: Command[]}
    const groups: any = {};
    for (const cmd of this.Bobb.slashCommands) {
      //first we have to gather all commands that are groups to each other
      const {
        slashOptions: { groupName },
      } = cmd;

      if (groupName) {
        !groups?.[groupName]
          ? (groups[groupName] = [cmd])
          : groups[groupName].push(cmd);

        continue;
      }

      //non groups. just push em to the toUpload array
      if (categories?.includes(cmd.category) || categories?.includes("all")) {
        ret.push(
          (cmd.slashOptions.commandOptions as SlashCommandBuilder).toJSON()
        );
      }
    }

    // now that we have all the grouped commands, turn it into slashCommandBuilder json mode.
    for (const groupName in groups) {
      const groupCMD = new SlashCommandBuilder()
        .setName(groupName)
        .setDescription(
          COMMAND_GROUP_DESCRIPTIONS[groupName as COMMAND_GROUP_NAMES]
        )
        .setDMPermission(false);

      groups[groupName].forEach((subCmd: Command) =>
        groupCMD.addSubcommand(
          subCmd.slashOptions.commandOptions as SlashCommandSubcommandBuilder
        )
      );

      ret.push(groupCMD.toJSON());
    }

    return ret;
  }

  /**
   * Prints the commands that are currently in the system. SIMPLY FOR DEV PURPOSES
   *
   * @return {void} everything is done in the function
   */
  async _displayAPIInteractions() {
    const clientId = this.Bobb.client.user!.id;
    const BOT_REST = new REST({ version: "10" }).setToken(
      this.Bobb.config.botToken
    );

    //Clean all global commands
    const allSlashCommands = (await BOT_REST.get(
      Routes.applicationCommands(clientId)
    )) as Discord.RESTGetAPIApplicationCommandsResult;

    console.log(`AVAILABLE GLOBAL COMMANDS: ${allSlashCommands}`);

    const guildCmds: any[] = [];
    const guilds = await this.Bobb.client.guilds.fetch();

    await this.Bobb.utils.asyncForEach(
      guilds.map((guild: OAuth2Guild) => guild.id),
      async (id: Snowflake) => {
        const cmds = (await BOT_REST.get(
          Routes.applicationGuildCommands(clientId, id)
        )) as Discord.RESTGetAPIApplicationGuildCommandsResult;
        for (const cmd of cmds) {
          guildCmds.push({
            name: cmd.name,
            guild_id: cmd.guild_id,
            options: cmd.options?.map((opt) =>
              JSON.stringify({
                type: opt.type,
                name: opt.name,
                required: opt.required,
              })
            ),
          });
        }
      }
    );

    console.log(`AVAILABLE GUILD COMMANDS: ${console.table(guildCmds)}`);
  }

  /**
   * Combine the helper functions and does the slash interaction loading for when the bot is ready.
   *
   * @param {Array<COMMAND_CATEGORIES>} categoriesToLoad The categories of commands to load
   * @return {Promise<void>}
   */
  async cleanAndLoadInts(categoriesToLoad: Array<COMMAND_CATEGORIES>) {
    const jsonizedCmds = this.convertCommandsToJSON(categoriesToLoad);
    await this.removeAllInteractions();
    await this.loadInteractions(jsonizedCmds);
  }

  /**
   * Finds a command given an interaction
   *
   * @param {ChatInputCommandInteraction} interaction The interaction to get a command from
   * @return {Command} The found command. Should always be successful unless the uploaded slash commands are wrong
   */
  getCommand(interaction: ChatInputCommandInteraction): Command {
    const subCMD = interaction.options?.getSubcommand(false);
    let name: string;
    subCMD
      ? (name = interaction.commandName + subCMD)
      : (name = interaction.commandName);
    let command: Command = this.Bobb.slashCommands.find((c: Command) =>
      c.name.includes(name.toLowerCase())
    )!;
    return command;
  }
}
