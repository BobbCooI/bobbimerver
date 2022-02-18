import Discord from "discord.js"
import _ from "lodash"
import { slashMessage } from "../../../lib/bot/discordExtensions";
import { handleRes } from "../utils";
exports.handleSlashCommand = async function (msg: slashMessage) {
    let { command } = msg

    if (!command) return;

    const bypass = command.props.bypassVerification;

    let runner = await this.db.fetchMemberInfo({ discID: msg.author.id });
    if (!runner && !bypass && !msg.slashCommand.inGuild())
        return command.editReply(
            'Please verify in DMs before using commands.'
        );
    let cmdSpam = runner ? runner.spam : 0;
    let latestCmd = runner ? runner.latestCmd : false;

    if (cmdSpam > 10500) {
        try {
            await command.editReply({
                content: 'You have been blacklisted from the bot for spamming over 10,000 times. Nice.\nYou can appeal at this link and we will check it within 2 weeks',
            });
        } catch (e) {
            await this.loggers.log(`User ${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) did not get the appeal DM. Error ${e.message}`);
        }
        return;
    }
    await this.db.updateStats.call(this, msg, command, latestCmd);

    const isInCooldown = await this.db.checkCooldowns.call(this, msg, command);
    if (isInCooldown) {
        return;
    }
    const updateCooldowns = () =>
        this.db.updateCooldowns(
            command.props.name,
            msg.author.id!
        );
    let permissions: any = new Discord.Permissions().add(["SEND_MESSAGES"]);

    if (command.guildId) {
        permissions = (await this.client.channels.fetch(
            command.channelId
        )).permissionsFor(this.client.user.id);
    }
    if (command.props.permissions?.some((perm: any) => !permissions.has(perm))) {
        console.log(permissions, command.props?.permissions, 'Error! no perms!');
        // checkPerms.call(this, command, permissions, message);
    }
    //@ts-ignore
    if (command.props.restrictTo == "dm" && msg.slashCommand.inGuild()) return handleRes("This command can only be ran inside DMs.", command, "slash", msg);

    let res: any = await command.run({
        //@ts-ignore
        Swessage: msg,
        addCD: updateCooldowns
    });
    //@ts-ignore
    return handleRes(res, command, "slash", msg)
}