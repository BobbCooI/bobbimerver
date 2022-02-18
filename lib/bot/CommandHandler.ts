import Bobb from "../../src/bot/botClass";
import fs from "fs"
import path from "path"
import ContextMenuCommand from "../../src/bot/commandTypes/ContextMenu";
import { Command } from "./Command";
import Discord, { Snowflake } from "discord.js"

export default class CommandHandler {
  declare Bobb: Bobb

  constructor(Bobb: Bobb) {
    this.Bobb = Bobb;
  }
  async loadMessageCommands(slashToo?: boolean): Promise<void> {
    const categories = fs.readdirSync(path.join(__dirname, "..", "..", "src", "bot", "commands"));
    await this.Bobb.utils.asyncForEach(categories, async (categoryPath: string) => {
      let category = (await import(path.join(__dirname, "..", "..", "src", "bot", "commands", categoryPath))).default;//.catch((e: any) => console.log(e))).default;
      category.commands = await Promise.all(category.commands.map(async (command: any): Promise<ContextMenuCommand | Command | undefined> => {
        let elCmd = await command;

        if (!elCmd.default.enabled) return;
        if (elCmd.default instanceof ContextMenuCommand) {
          this.Bobb.contextMenus.push(elCmd.default)
          return;
        } else if (elCmd.default instanceof Command) {
          this.Bobb.cmds.push(elCmd.default)
          if (slashToo) elCmd.default.registerSlashCommand(this.Bobb.client)
          return;
        } else return elCmd.default;
      })).catch((e: any) => console.log(e))

    })
  }
  async loadInteractions({ guildId, cleanAll }: { guildId?: Snowflake, cleanAll?: boolean }) {
    const slashCommands = await this.Bobb.client.application!.commands.fetch();
    if (slashCommands?.size) {
      if (cleanAll) {
        this.Bobb.client.application!.commands.set([]);
        this.Bobb.client.application!.commands.set([], guildId || '');
      }
      let commands: (Discord.ApplicationCommandData & { name?: string })[] = [];

      for (const cmd of this.Bobb.cmds) {

        if (
          cmd.enableSlashCommand &&
          slashCommands.find((s: Discord.ApplicationCommand) => s.name == cmd.props.name)
        )
          commands.push(
            cmd.getSlashCommandJSON(
              slashCommands.findKey((s: Discord.ApplicationCommand) => s.name == cmd.props.name)
            )
          );
      }

      for (const cmd of this.Bobb.contextMenus) {
        const opts = cmd.opts;
        if (!opts) throw new Error(`[ContextMenuCommands] Failed to update context menu command\n${cmd}`)
        //@ts-ignore
        commands.push(opts)
      }
      const updated = await this.Bobb.client.application!.commands
        .set(commands, guildId || '')
        .catch((e: Error) => {
          console.error(
            `[Commands] Failed to update slash commands\n${e.stack}`
          );
          return new Discord.Collection<Discord.Snowflake, Discord.ApplicationCommand>();
        });
      if (updated && updated.size)
        console.log(
          `[Commands] Successfully bulk updated ${updated.size} slash commands`
        );

      for (const [, slashCommand] of slashCommands) {
        if (
          !this.getCommand(slashCommand.name) ||
          !this.getCommand(slashCommand.name)?.enableSlashCommand
        ) {

          console.warn(
            `[Commands] Deleting slash command /${slashCommand.name} due to command not being found or slash command disabled`
          );
          if (slashCommands.get(slashCommand.name))
            await this.Bobb.client.application!.commands
              .delete(slashCommand, guildId || "")
              .catch((e) =>
                console.error(
                  `[Commands] Failed to delete slash command /${slashCommand.name}\n${e}`
                )
              );
        }
      }
    }



    /*let slashCmds = await this.client.api.applications(this.client.user.id).guilds('699487357400907867').commands.get();
slashCmds.forEach(async cmd => {
  if(!this.cmds.find(nor => (nor.props.slashCmd && nor.props.slashOpts.name) === cmd.name)) await this.utils.cmdReq.delete(`/${cmd.id}`);
}); ONLY IF I EVERY WANT TO DELETE A COMMAND */


  }

  getCommand(name: string) {
    let command: Command | undefined = this.Bobb.cmds.find((c: Command) => c.attributes.name.includes(name.toLowerCase()));
    return command
  }
}