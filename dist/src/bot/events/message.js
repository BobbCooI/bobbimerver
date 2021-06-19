"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const discord_js_1 = __importStar(require("discord.js"));
const constants_1 = require("../../utils/constants");
const lodash_1 = __importDefault(require("lodash"));
exports.handle = function (message) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        let st = Date.now();
        if (message.author.bot) {
            return;
        }
        yield this.botStats.findOneAndUpdate({ _id: "60070be0f12d9e041931de68" }, { $inc: { messages: 1 } });
        yield cacheMessage.call(this, message);
        const guildID = message.guild ? message.guild.id : false;
        const gConfig = guildID
            ? yield this.db.getGuild(guildID)
            : { prefix: process.env.prefix };
        gConfig.prefix = this.client.prefix;
        gConfig.disabledCategories = gConfig.disabledCategories
            ? gConfig.disabledCategories
            : [];
        gConfig.enabledCommands = gConfig.enabledCommands
            ? gConfig.enabledCommands
            : [];
        gConfig.disabledCommands = gConfig.disabledCommands
            ? gConfig.disabledCommands
            : [];
        if (!gConfig.autoResponse) {
            gConfig.autoResponse = {
                dad: false,
                ree: false,
                sec: false,
                nou: false
            };
        }
        for (const autoResponse in gConfig.autoResponse) {
            if (gConfig.autoResponse[autoResponse]) {
                const entry = constants_1.AUTORESPONSE_MATRIX[autoResponse];
                const match = entry.regex.exec(message.content);
                if (match) {
                    const result = yield entry.parse(match);
                    if (result.length <= 2000) {
                        message.channel.send(result);
                    }
                }
            }
        }
        if (gConfig.swearFilter) {
            if (constants_1.SWEARWORDS.some((word) => message.content.toLowerCase().includes(word))) {
                message.channel.send(`No swearing in this christian server :rage:\n${yield message
                    .delete()
                    .then(() => "")
                    .catch(() => {
                    return message.channel.send("I couldn't remove the offending message because I don't have `Manage Messages` :(");
                })}`);
            }
        }
        const selfMember = message.guild
            ? message.guild.me
            : { nickname: false, id: "747231069002006609" };
        let mention = `<@${(selfMember === null || selfMember === void 0 ? void 0 : selfMember.nickname) ? "!" : ""}${selfMember === null || selfMember === void 0 ? void 0 : selfMember.id}>`;
        const wasMentioned = message.content.startsWith(mention);
        if (message.content.slice(mention.length)[0] === " ")
            mention = mention += " ";
        const triggerLength = (wasMentioned ? mention : gConfig.prefix).length;
        if (!message.content.toLowerCase().startsWith(gConfig.prefix) &&
            !wasMentioned) {
            return;
        }
        let args = message.content.slice(triggerLength).split(/ +/g);
        let command = args[0];
        args = args.slice(1);
        command =
            command &&
                this.cmds.find((c) => c.props.triggers.includes(command.toLowerCase()));
        if (!command &&
            ((_a = message === null || message === void 0 ? void 0 : message.mentions) === null || _a === void 0 ? void 0 : _a.has(((_c = (_b = this === null || this === void 0 ? void 0 : this.client) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.id) || "747231069002006609")) &&
            message.content.toLowerCase().includes("hello")) {
            return message.channel.send(`Hello, ${message.author.username}. My prefix is \`${gConfig.prefix}\`. Example: \`${gConfig.prefix} meme\``);
        }
        else if (!command ||
            (command.props.ownerOnly &&
                !this.config.options.developers.includes(message.author.id)) ||
            gConfig.disabledCommands.includes(command.props.triggers[0]) ||
            ((gConfig.disabledCategories || []).includes(command.category.split(" ")[1].toLowerCase()) &&
                !["disable", "enable"].includes(command.props.triggers[0]) &&
                !gConfig.enabledCommands.includes(command.props.triggers[0]))) {
            return;
        }
        if (command.props.dmOnly && message.channel.type !== "dm")
            return;
        let runner = yield this.db.fetchMemberInfo({ discID: message.author.id });
        let cmdSpam = runner ? runner.spam : 0;
        let latestCmd = runner ? runner.latestCmd : false;
        if (cmdSpam > 10500) {
            try {
                yield message.author.send("You have been blacklisted from the bot for spamming over 10,000 times. Nice.\nYou can appeal at this link and we will check it within 2 weeks");
            }
            catch (e) {
                yield this.loggers.log(`User ${message.author.username}#${message.author.discriminator} (${message.author.id}) did not get the appeal DM. Error ${e.message}`);
            }
            return;
        }
        yield updateStats.call(this, message, command, latestCmd);
        const isInCooldown = yield checkCooldowns.call(this, message, command);
        if (isInCooldown) {
            return;
        }
        const updateCooldowns = () => this.db.updateCooldowns(command.props.triggers[0], message.author.id);
        try {
            let permissions = new discord_js_1.Permissions().add([discord_js_1.Permissions.FLAGS.SEND_MESSAGES]);
            if (message.guild) {
                permissions = (_d = message.channel) === null || _d === void 0 ? void 0 : _d.permissionsFor(message.guild.me);
            }
            if (command.props.perms.some((perm) => !permissions.has(perm))) {
                checkPerms.call(this, command, permissions, message);
            }
            else if (command.props.isNSFW &&
                message.guild &&
                message.channel.type.toUpperCase() !== "DM" &&
                !message.channel.nsfw) {
                message.channel.send({
                    embeds: [new discord_js_1.default.MessageEmbed()
                            .setTitle("NSFW not allowed here")
                            .setDescription("Use NSFW commands in a NSFW marked channel (look in channel settings, dummy)")
                            .setColor(this.misc.randomColor())
                            .setImage(constants_1.gifs.nsfw)
                    ]
                });
            }
            else {
                yield runCommand.call(this, command, message, args, updateCooldowns, permissions);
            }
            console.log(`Command ${command.props.triggers[0]} took: ${Date.now() - st}ms to run.`);
        }
        catch (e) {
            this.loggers.reportError.call(this, e, message, command, args);
        }
    });
};
function cacheMessage(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!msg.content || msg.author.bot) {
            return;
        }
        if (msg.channel.id == "739273462559932446")
            return;
        const guildID = msg.guild ? msg.guild.id : "DMs";
        yield this.loggers.cacheMessage(new discord_js_1.default.MessageEmbed()
            .setTitle(`Message ID - ${msg.id}`)
            .setDescription(JSON.stringify({
            userID: msg.author.id,
            content: msg.content,
            timestamp: msg.createdTimestamp,
            guildID: guildID,
            channelID: msg.channel.id
        })));
    });
}
function updateStats(message, command, lastCmd) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(command.props.triggers[0]);
        if (lastCmd && Date.now() - lastCmd < 500) {
            yield this.db.addSpam(message.author.id);
        }
        yield this.botStats.findOneAndUpdate({ _id: "60070be0f12d9e041931de68" }, { $inc: { commands: 1 } });
        yield this.db.updateMember(message.author.id, {
            $inc: { cmdsRan: 1 },
            $set: { latestCmd: new Date() }
        });
    });
}
function checkCooldowns(message, command) {
    return __awaiter(this, void 0, void 0, function* () {
        const cooldown = yield this.db.getSpecificCooldown(command.props, message.author.id);
        if (cooldown > Date.now() && process.env.NODE_ENV !== "dev") {
            const waitTime = (cooldown - Date.now()) / 1000;
            let cooldownWarning = command.props.cooldownMessage ||
                `__Time left until you can run this command again:__ `;
            const cooldownMessage = new discord_js_1.default.MessageEmbed()
                .setColor(this.misc.randomColor())
                .setTitle("hold on 😩")
                .setDescription(cooldownWarning +
                (waitTime > 60
                    ? `**${this.misc.parseTime(waitTime)}**`
                    : `**${waitTime.toFixed()} second${parseInt(waitTime.toFixed()) > 1 ? "s" : ""}**`) +
                `\n\n**Default Cooldown**: ${this.misc.parseTime(command.props.cooldown / 1000)}\n**[Donor]() Cooldown**: ${this.misc.parseTime(command.props.cooldown / 1000)}\n\ntoo fast yo`);
            yield this.db.addSpam(message.author.id);
            message.channel.send({ embeds: [cooldownMessage] });
            return true;
        }
        return false;
    });
}
function checkPerms(command, permissions, message) {
    const neededPerms = command.props.perms.filter((perm) => !permissions.has(perm));
    if (permissions.has(discord_js_1.Permissions.FLAGS.SEND_MESSAGES)) {
        if (permissions.has(discord_js_1.Permissions.FLAGS.EMBED_LINKS)) {
            message.channel.send({ embeds: [
                    new discord_js_1.default.MessageEmbed()
                        .setTitle("oh no!")
                        .setDescription(`You need to add **${neededPerms.length > 1 ? neededPerms.join(", ") : neededPerms}** to use this command!\nGo to **Server settings => Roles => asuna-kun** to change this!`)
                        .setColor(this.misc.randomColor())
                        .setImage(neededPerms.length === 1
                        ? constants_1.gifs[neededPerms[0]]
                        : constants_1.gifs.manageMessages)
                        .setFooter("If it still doesn't work, check channel permissions too!")
                ] });
        }
        else {
            message.channel.send(`You need to add **${neededPerms.join(", ")}** to use this command!\n\nGo to **Server settings => Roles => Dank Memer** to change this!`);
        }
    }
}
function runCommand(command, message, args, updateCooldowns, _permissions) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield command.run({
            message,
            args,
            Bobb: this,
            addCD: updateCooldowns
        });
        if (!res) {
            return;
        }
        if (res instanceof this.Return) {
            if (res.Paginate)
                return;
            if (res.embeds) {
            }
            if (lodash_1.default.isEmpty(res))
                throw `No content to send back for interaction ${command.props.triggers[0]} ?`;
        }
        else if (typeof res == "string") {
            res = { content: res };
        }
        else {
            throw `What kind of return for ${command.props.triggers[0]}?`;
        }
        console.log(res);
        return yield message.channel.send(res).catch((e) => this.loggers.reportError(e, message, command));
    });
}
//# sourceMappingURL=message.js.map