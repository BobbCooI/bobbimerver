import Discord from "discord.js"
import ContextMenuCommand from "../../../src/bot/commandTypes/ContextMenu";
import { Return } from "../../bot/botTypes";

import _ from "lodash"
//import { handleRes } from "../utils";
//@ts-ignore
exports.handleContextMenu = async function (menu: Discord.ContextMenuInteraction) {
    await menu.deferReply()
    const command: ContextMenuCommand = menu.commandName && this.contextMenus.find(
        (c: ContextMenuCommand) => (c.props?.name?.toLowerCase()) === menu.commandName.toLowerCase()
    );
    if (!command) {
        console.warn(`Unknown menu was found! ${menu.commandName} by ${menu.user}`)
        return menu.editReply({ content: "Unknown menu found." })
    }
    let res = await command.run({
        Bobb: this,
        menu
    });
//handleRes(res, command, "contextMenu", menu)
    if (!res) {
        return;
    }
    if (typeof res === "string") {
        res = {
            content: res
        };
    } else if (res instanceof Return) {
        if (res.Paginate) return;
        let obj: any = {
        }
        if (res.content) obj.content = res.content;
        if (res.embeds) obj.embeds = res.embeds;
        if (res.file) obj.file = res.file;
        if (_.isEmpty(obj)) throw new Error(`No content to send back for cmd ${command.props.name} ? ( empty object )`)
        res = obj;
    } else {
        throw new Error(`What kind of return for ${command.props.name}?`)
    }

    return menu.editReply(res);
}