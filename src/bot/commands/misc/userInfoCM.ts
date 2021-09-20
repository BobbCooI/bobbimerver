import { MessageEmbed } from "discord.js";
import ContextMenuCommand from "../../commandTypes/ContextMenu"
import { runFnArgs } from '../../../../lib/bot/botTypes';

export default new ContextMenuCommand({
    name: "User Info",
    type: "USER"
}, async ({ Bobb, menu }: runFnArgs) => {
    const targetUser = menu?.client.users.resolve(menu.targetId)!
    let userInfoEmbed = new MessageEmbed()
    userInfoEmbed.setAuthor(targetUser.tag)
    userInfoEmbed.setImage(targetUser.displayAvatarURL())
    userInfoEmbed.setTimestamp()

    let Return = new Bobb!.Return(Bobb!)
    Return.setEmbeds([userInfoEmbed])
    return Return
})