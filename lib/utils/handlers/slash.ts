import _ from "lodash";
import { handleRes, slashInteraction } from "../../bot/discordThings";

exports.handleSlashCommand = async function (msg: slashInteraction) {
  let { slash } = msg;
  //if (msg.command.slashOptions.isSubCommand) {console.log("I AM HAHA")}
  if (!slash) return;

  const bypass = msg.command.bypassVerification;

  let runner = await this.db.fetchMemberInfo({ discID: msg.slash.user.id });
  if (!runner && !bypass && !msg.slash.inGuild())
    return slash.editReply("Please verify in DMs before using commands.");
  let cmdSpam = runner ? runner.spam : 0;
  let latestCmd = runner ? runner.latestCmd : false;

  if (cmdSpam > 10500) {
    try {
      await slash.editReply({
        content:
          "You have been blacklisted from the bot for spamming over 10,000 times. Nice.\nYou can appeal at this link and we will check it within 2 weeks",
      });
    } catch (e) {
      await this.loggers.log(
        `User ${msg.slash.user.username}#${msg.slash.user.discriminator} (${msg.slash.user.id}) did not get the appeal DM. Error ${e.message}`
      );
    }
    return;
  }
  await this.db.updateStats.call(this, msg, slash, latestCmd);

  const isInCooldown = await this.db.checkCooldowns.call(
    this,
    msg,
    msg.command
  );
  if (isInCooldown) {
    return;
  }
  const updateCooldowns = () =>
    this.db.updateCooldowns(msg.command.name, msg.slash.user.id);

  //@ts-ignore
  //if (command.props.restrictTo == "dm" && msg.slashCommand.inGuild()) return handleRes("This command can only be ran inside DMs.", command, "slash", msg);

  let res: any = await msg.command.run({
    //@ts-ignore
    slashInt: msg,
    addCD: updateCooldowns,
  });
  //@ts-ignore
  return handleRes(res, msg.command, "slash", msg);
};
