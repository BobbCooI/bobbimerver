import GenericCommand from "../../commandTypes/GenericCommand";
import Discord from "discord.js";
import { runFnArgs} from '../../../types/bot';
export default new GenericCommand(
  {
    triggers: ["help", "he", "h"],
    usage: "{command} <commandName>",
    bypass: true,
    description: "See all the commands",
    slashCmd: true,
    slashOpts: {
      name: "help",
      description:
        "See all the commands or find out how to use a specific command.",
      options: [
        {
          name: "command",
          description: "Specific command",
          type: 3,
          required: false
        }
      ],
    },
    cooldown: 3000
  },
  async ({ Bobb, argManager, addCD }: runFnArgs) => {
    addCD();
    if (argManager!.args?.[0]) {
      let command = Bobb!.cmds.find((c: GenericCommand) =>
        c.props.triggers.includes(argManager!.args?.[0]?.toLowerCase())
      );
      if (!command)
        return "I could not find that command. Try running the `help` command by itself and see a list of commands.";
      const embed = new Discord.MessageEmbed()
        .setTitle(
          `Information on ${Bobb!.utils.capitalize(command.props.triggers[0])}`
        )
        .setDescription(`Triggers: ${command.props.triggers.join(" | ")}`)
        .addField("Usage: ", `${command.props.usage}`, true)
         .addField("Description: ", command.props.description, true)
        .setTimestamp()
        .setFooter(":)");
        
        let ret = new Bobb!.Return("message");
      ret.setEmbeds([embed]);
      return ret;
    } else {
      let allCommands = Bobb!.cmds.map(
        (c: GenericCommand) => `**${c.props.triggers[0]}** - Category: ${c.category}`
      );
      const embed = new Discord.MessageEmbed()
        .setTitle("Commands")
        .setDescription(allCommands.join("\n"))
        .setTimestamp()
        .setFooter(":)");
      let ret = new Bobb!.Return("message");
      ret.setEmbeds([embed]);
      return ret;
    }
  },
  async ({ Bobb, argslash, addCD }: runFnArgs) => {
    addCD();
    if (argslash!.get("command")?.value) {
      let command = Bobb!.cmds.find((c:GenericCommand)=>
        c.props.triggers.includes((argslash!.get("command")?.value as string).toLowerCase())
      );
      if (!command)
        return "I could not find that command. Try running the `help` command by itself and see a list of commands.";
      const embed = new Discord.MessageEmbed()
        .setTitle(
          `Information on ${Bobb!.utils.capitalize(command.props.triggers[0])}`
        )
        .setDescription(`Triggers: ${command.props.triggers.join(" | ")}`)
        .addField("Usage: ", `${command.props.usage}`, true)
        .setTimestamp()
        .setFooter(":)");
      if(command.props.description) embed.addField("Description: ", command.props.description, true);
      let Ret= new Bobb!.Return("message")
      Ret.setEmbeds([embed]);
      return Ret
    } else {
      let allCommands = Bobb!.cmds.map(
        (c: GenericCommand) => `**${c.props.triggers[0]}** - Category: ${c.category}`
      );
      const embed = new Discord.MessageEmbed()
        .setTitle("Commands")
        .setDescription(allCommands.join("\n"))
        .setTimestamp()
        .setFooter(":)");

      let Ret = new Bobb!.Return("message")
      Ret.setEmbeds([embed]);
      return Ret;
      //{multiple: true, embeds: [embed, embed],content: "Here are the commands!"};
    }
  }
);
