"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const bot_1 = require("../../types/bot");
const lodash_1 = __importDefault(require("lodash"));
exports.handle = function (interaction) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        yield interaction.defer();
        if (interaction.isCommand()) {
            console.log(interaction.options, Object.keys(interaction));
            let { commandName } = interaction;
            const args = interaction.options;
            const command = commandName && this.cmds.find((c) => { var _a, _b, _c, _d; return (((_a = c.props) === null || _a === void 0 ? void 0 : _a.slashCmd) && ((_d = (_c = (_b = c.props) === null || _b === void 0 ? void 0 : _b.slashOpts) === null || _c === void 0 ? void 0 : _c.name) === null || _d === void 0 ? void 0 : _d.toLowerCase())) === commandName.toLowerCase(); });
            if (!command)
                return;
            const bypass = command.props.bypass;
            if (command.props.dmOnly && !interaction.guildID)
                return;
            let runner = yield this.db.fetchMemberInfo({ discID: interaction.user.id });
            if (!runner && !bypass && !interaction.guildID)
                return interaction.editReply('Please verify in DMs before using commands.');
            let cmdSpam = runner ? runner.spam : 0;
            let latestCmd = runner ? runner.latestCmd : false;
            if (cmdSpam > 10500) {
                try {
                    yield interaction.editReply({
                        content: 'You have been blacklisted from the bot for spamming over 10,000 times. Nice.\nYou can appeal at this link and we will check it within 2 weeks',
                    });
                }
                catch (e) {
                    yield this.loggers.log(`User ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id}) did not get the appeal DM. Error ${e.message}`);
                }
                return;
            }
            yield updateStats.call(this, interaction, command, latestCmd);
            const isInCooldown = yield checkCooldowns.call(this, interaction, command);
            if (isInCooldown) {
                return;
            }
            const updateCooldowns = () => {
                var _a;
                return this.db.updateCooldowns((_a = command === null || command === void 0 ? void 0 : command.props) === null || _a === void 0 ? void 0 : _a.triggers[0], interaction.user.id);
            };
            let permissions = new discord_js_1.Permissions().add(["SEND_MESSAGES"]);
            if (interaction.guildID) {
                permissions = (yield this.client.channels.fetch(interaction.channelID)).permissionsFor(this.client.user.id);
            }
            if (command.props.perms.some((perm) => !permissions.has(perm))) {
                console.log(permissions, (_a = command === null || command === void 0 ? void 0 : command.props) === null || _a === void 0 ? void 0 : _a.perms, 'Error! no perms!');
            }
            let res = yield command.fnSlash.run({
                Bobb: this,
                interaction,
                argslash: args,
                addCD: updateCooldowns
            });
            if (!res) {
                return;
            }
            if (typeof res === "string") {
                res = {
                    content: res
                };
            }
            else if (res instanceof bot_1.Return) {
                if (res.Paginate)
                    return;
                let obj = {};
                if (res.content)
                    obj.content = res.content;
                if (res.embeds)
                    obj.embeds = res.embeds;
                if (res.file)
                    obj.file = res.file;
                if (lodash_1.default.isEmpty(obj))
                    throw `No content to send back for interaction ${command.props.triggers[0]} ?`;
                res = obj;
            }
            else {
                throw `What kind of return for ${command.props.triggers[0]}?`;
            }
            console.log(res);
            yield interaction.editReply(res);
        }
    });
};
function checkCooldowns(interaction, command) {
    return __awaiter(this, void 0, void 0, function* () {
        const cooldown = yield this.db.getSpecificCooldown(command.props, interaction.user.id);
        if (cooldown > Date.now() && process.env.NODE_ENV !== 'dev') {
            const waitTime = (cooldown - Date.now()) / 1000;
            let cooldownWarning = command.props.cooldownMessage ||
                `**time left until you can run this command again:** `;
            const cooldownMessage = new discord_js_1.MessageEmbed()
                .setColor(this.misc.randomColor())
                .setTitle('chill 😩')
                .setDescription(cooldownWarning +
                (waitTime > 60
                    ? `__${this.misc.parseTime(waitTime)}__`
                    : `__${waitTime.toFixed()} seconds__`) +
                `\n\n**default cooldown**: ${this.misc.parseTime(command.props.cooldown / 1000)}\n**[donor]() cooldown**: ${this.misc.parseTime(command.props.cooldown / 1000)}\n\nok!`);
            yield this.db.addSpam(interaction.user.id);
            yield interaction.editReply({ embeds: [cooldownMessage] });
            return true;
        }
        return false;
    });
}
function updateStats(interaction, command, lastCmd) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Interaction command: ${command.props.triggers[0]} ran by ${interaction.user.tag}:${interaction.user.id}`);
        let userID = interaction.user.id;
        if (lastCmd && Date.now() - lastCmd < 500) {
            yield this.db.addSpam(userID);
        }
        yield this.botStats.findOneAndUpdate({ _id: '60070be0f12d9e041931de68' }, { $inc: { slashCommands: 1 } });
        yield this.db.updateMember(userID, {
            $inc: { cmdsRan: 1 },
            $set: { latestCmd: new Date() }
        });
    });
}
//# sourceMappingURL=interaction.js.map