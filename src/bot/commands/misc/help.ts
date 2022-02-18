import {
    BitFieldResolvable,
    PermissionString,
    GuildChannel,
    Permissions,
    MessageEmbed
} from "discord.js";
import { executeArgs } from "lib/bot/botTypes";
import { Command } from "../../../../lib/bot/Command";
//const userMentionRegex = /<@!?(\d{15,21})>$/im;

export default new Command({
    name: "help",
    description: "yes",
    clientPermissions: [
        Permissions.FLAGS.SEND_MESSAGES,
        Permissions.FLAGS.EMBED_LINKS,
    ],
    aliases: ["h"],
    args: [
        {
            id: "command",
            type: "string", //can get more advanced later to have it check if its command in MESSAGE_CREATE
            default: undefined,
            required: false,
        },
    ],
    enableSlashCommand: true,
    restrictTo: "all",
    ephemeral: true,
    cooldown: 3000
},
    async({ Swessage, addCD }: executeArgs)  => {

        if( !Swessage.args) return "no";
    addCD?.()
    let embed: MessageEmbed;
    if(Swessage.args.get("command")?.value) {
        let command = Swessage.Bobb.cmds.find((c: Command) =>
        (c.name === (Swessage.args?.get("command")!.value as string)?.toLowerCase()) || c.props.aliases?.includes(Swessage.args?.get("command")!.value as string)
      );
      if (!command)
        return "I could not find that command. Try running the `help` command by itself and see a list of commands.";
      embed = Swessage.Bobb.utils.constructHelp(command)

  
    } else {
    let allCommands = Swessage.Bobb.cmds.filter((c: Command) => {

        if (c.ownerOnly && !Swessage.Bobb.db.isSuperuser(Swessage.author)) return false;
    

                if (c.hidden && !Swessage.Bobb.db.isSuperuser(Swessage.author)) return false;
                if (c.ownerOnly && !Swessage.Bobb.client.owners.includes(Swessage.author.id))
                    return false;
                
                if (c.channel == "guild" && !Swessage.guild) return false;
                if (
                    (c.userPermissions as PermissionString[])?.length &&
                    !Swessage.guild
                )
                    return false;
                if (
                    (c.userPermissions as PermissionString[])?.length &&
                    (Swessage.channel as GuildChannel)
                        .permissionsFor(Swessage.author)
                        ?.missing(
                            c.userPermissions as BitFieldResolvable<
                                PermissionString,
                                bigint
                            >
                        ).length
                )
                    return false;
                return true;
            })
            .map((c: Command) => c.parent? `\`${c.props.name.replace("-", " ")}\``: `\`${c.props.name}\``);
            
             
        
     embed = new MessageEmbed({
        title: "Commands",
        author: {
            icon_url: Swessage.Bobb.client.user!.displayAvatarURL({
                size: 2048,
                format: "png",
            }),
        }})
        .setDescription(allCommands.join("\n"))
        .setTimestamp()
        .setFooter(":p");
    }
    let Ret = new Swessage.Bobb!.Return(Swessage.Bobb)
    Ret.setEmbeds([embed]);
    return Ret;
 
})