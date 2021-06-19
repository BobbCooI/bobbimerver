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
const fs_1 = __importDefault(require("fs"));
const discord_js_1 = __importDefault(require("discord.js"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const errors = {
    Disconnected: `Discord fucked something up. 😠\n\nTo fix this, you have to got to server settings and change the voice region.\nIf it still doesn't work after that, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`vc1\`.`,
    "Voice connection timeout": `Discord fucked something up. 😠\n\nTo fix this, first try running \`pls stop\`.\nIf that doesn't work, you have to kick me and reinvite me back. I know, it is stupid. 🙄\nIf it still doesn't work after that, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`vc2\`.`,
    "Already encoding": `Something fucked up. 😠\n\nWe're pretty sure this error happens when you're running voice commands too quickly. So slow down 🙄\nIf it's still happening after a while, (<https://discord.gg/Wejhbd4>) and tell support it is error \`vc3\`.`,
    new_val: `Oopsy doopsy, we made a fucky wucky! 😊\n\nThis shouldn't happen to you again, and we are working semi-hard on fixing it. \nIf it DOES happen again, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`econ1\`.`,
    "Invalid character in header content": `Well heck, I didn't like some character you used for this command! 😠\n\nIf you used any "not normal" characters for this command, remove those and try again. \nIf it is still happening, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`img1\`.`,
    "socket hang up": `Looks like we just restarted our image server\n\nOnce it is done rebooting, this command will work again. Give it just a few seconds!\nIf it is still happening after multiple minutes, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`img2\`.`,
    "DiscordRESTError [50001]: Missing Access": `Hey! For some reason I don't have permission to run that command. 😠\n\nMake sure you have given me the correct channel perms to run this command. \nIf it is still happening after messing with permissions, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis1\`.`,
    "Request timed out (>15000ms) on POST": `aggggghhhhhhhh discord is having connection issues 😠\n\nAll we can do is wait until they're better. Sorryyyyyy.\nIf it is still happening after a few hours, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis2\`.`,
    "DiscordRESTError [50013]: Missing Permissions": `Hey! For some reason I don't have permission to run that command. 😠\n\nMake sure you have given me the correct channel perms to run this command. \nIf it is still happening after messing with permissions, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis3\`.`,
    "Must be 2000 or fewer in length": `You included too many characters in that.\n\nI am only able to send 2k characters in one message, so please try again with less characters.\nIf it is still happening, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis4\`.`,
    "DiscordHTTPError: 500 INTERNAL SERVER ERROR on POST": `aggggghhhhhhhh discord is having connection issues 😠\n\nAll we can do is wait until they're better. Sorryyyyyy.\nIf it is still happening after a few hours, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis5\`.`,
    "Cannot read property 'triggers' of undefined": `This command is currently under maintenance, sorry :(\n\nIt will work if you are spelling the command you are enabling/disabling correctly.\nIf it is still happening, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`bug1\`.`,
    "504 Gateway Timeout": `Look like the service we use for this command is giving us problems :(\n\nAll we can currently do is wait, sadly\nIf it is still happening after a few hours, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`bug2\`.`,
    "DiscordRESTError [10003]: Unknown Channel": `Something broke!\n\nI am currently not sure why this bug is happening, but if you report this bug in the support server, you will get paid for it in meme coins.\nJoin (<https://discord.gg/Wejhbd4>) and tell support it is error \`hunt1\`.`
};
exports.default = (Bobb) => ({
    errorMessages(e) {
        console.log(e);
        return (errors[Object.keys(errors).find(error => e.includes(error))] ||
            false);
    },
    loadSlashCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            let e = yield Bobb.client
                .application
                .commands
                .set(Bobb.cmds.map(c => {
                return c.props.slashCmd
                    ? {
                        name: c.props.slashOpts.name.toLowerCase(),
                        description: c.props.slashOpts.description,
                        options: c.props.slashOpts.options
                            ? c.props.slashOpts.options
                            : []
                    }
                    : false;
            })
                .filter(c => c));
            e.forEach(cmd => Bobb.slashCmds.push(cmd.name));
            console.log(Bobb.slashCmds);
        });
    },
    createAPIMessage(interaction, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiMessage = yield discord_js_1.default.APIMessage.create(Bobb.client.channels.resolve(interaction.channelID), content)
                .resolveData()
                .resolveFiles();
            return Object.assign(Object.assign({}, apiMessage.data), { files: apiMessage.files });
        });
    },
    sendInitial(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Bobb.client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 5
                }
            });
        });
    },
    editMessage(interaction, content) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Bobb.client.api
                .webhooks(process.env.appID, interaction.token)
                .messages("@original")
                .patch({
                data: yield this.createAPIMessage(interaction, content)
            });
        });
    },
    sendMessage(interaction, content) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Bobb.client.api
                .interactions(interaction.id, interaction.token)
                .callback.post({
                data: {
                    type: 4,
                    data: yield this.createAPIMessage(interaction, content)
                }
            });
        });
    },
    parseTime(time) {
        const methods = [
            { name: "d", count: 86400 },
            { name: "h", count: 3600 },
            { name: "m", count: 60 },
            { name: "s", count: 1 }
        ];
        const timeStr = [
            Math.floor(time / methods[0].count).toString() + methods[0].name
        ];
        for (let i = 0; i < 3; i++) {
            timeStr.push(Math.floor((time % methods[i].count) / methods[i + 1].count).toString() + methods[i + 1].name);
        }
        return timeStr.filter(g => !g.startsWith("0")).join(", ");
    },
    unembedify(embed, content) {
        let embedString = "";
        if (embed.author)
            embedString += `**${embed.author.name}**\n`;
        if (embed.title)
            embedString += `**${embed.title}**\n`;
        if (embed.description)
            embedString += `${embed.description}\n`;
        for (const field of embed.fields || []) {
            embedString += `\n**${field.name}**\n${field.value}\n`;
        }
        if (embed.footer)
            embedString += `\n${embed.footer.text}`;
        return `${content || ""}\n${embedString || "Empty embed"}`;
    },
    randomNumber(min = 0, max = 100) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    randomColor() {
        return Math.floor(Math.random() * 0xffffff);
    },
    timeMili(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = (millis % 60000) / 1000;
        return (minutes.toString() +
            ":" +
            (seconds < 10 ? "0" : "") +
            seconds.toFixed(2).toString());
    },
    parseUser(message, person) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return __awaiter(this, void 0, void 0, function* () {
            yield ((_b = (_a = message === null || message === void 0 ? void 0 : message.guild) === null || _a === void 0 ? void 0 : _a.members) === null || _b === void 0 ? void 0 : _b.fetch({ cache: true }));
            const idMatcher = /^([0-9]{15,21})$/;
            const userMentionMatcher = /<@!?([0-9]{15,21})>/;
            let posibID = idMatcher.exec(person) || userMentionMatcher.exec(person);
            if (posibID) {
                return yield ((_d = (_c = message === null || message === void 0 ? void 0 : message.guild) === null || _c === void 0 ? void 0 : _c.members) === null || _d === void 0 ? void 0 : _d.fetch(posibID[1]));
            }
            else {
                if (person.slice(-5, -4) === "#") {
                    return yield ((_g = (_f = (_e = message === null || message === void 0 ? void 0 : message.guild) === null || _e === void 0 ? void 0 : _e.members) === null || _f === void 0 ? void 0 : _f.cache) === null || _g === void 0 ? void 0 : _g.find(member => `${member.user.username}#${member.user.discriminator}` === person ||
                        `${member.nickname}#${member.user.discriminator}` === person));
                }
                else {
                    return yield ((_k = (_j = (_h = message.guild) === null || _h === void 0 ? void 0 : _h.members) === null || _j === void 0 ? void 0 : _j.cache) === null || _k === void 0 ? void 0 : _k.find(member => member.user.username === person || member.nickname === person));
                }
            }
            return undefined;
        });
    },
    formatNumber(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    },
    parseNum(thing) {
        if (!parseInt(thing))
            return null;
        let ret;
        if ((thing.includes("k") && thing.includes("e")) ||
            (thing.includes("k") && thing.includes(",")) ||
            (thing.includes("e") && thing.includes(",")))
            return null;
        if (thing.includes("k")) {
            let ind = thing.indexOf("e");
            ret = `${thing.slice(0, ind)}000`;
        }
        else if (thing.includes("e")) {
            let ind = thing.indexOf("e");
            let numAfterZero = thing.slice(ind + 1);
            let amtOfZeros = "0".repeat(parseInt(numAfterZero));
            ret = `${thing.slice(0, ind)}${amtOfZeros}`;
        }
        else if (thing.includes(",")) {
            ret = thing.replace(/,/g, "");
        }
        else {
            return null;
        }
        return parseInt(ret);
    },
    chunkSubstr(str, size) {
        const numChunks = Math.ceil(str.length / size);
        const chunks = new Array(numChunks);
        for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
            chunks[i] = str.substr(o, size);
        }
        return chunks;
    },
    moveImg(img, file) {
        var data = img.replace(/^data:image\/\w+;base64,/, "");
        var buf = Buffer.from(data, "base64");
        fs_1.default.writeFileSync(file, buf);
    },
    capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    },
    encode64(string) {
        const encodedWord = crypto_js_1.default.enc.Utf8.parse(string);
        const encoded = crypto_js_1.default.enc.Base64.stringify(encodedWord);
        return encoded;
    },
    decode64(string) {
        const encodedWord = crypto_js_1.default.enc.Base64.parse(string);
        const decoded = crypto_js_1.default.enc.Utf8.stringify(encodedWord);
        return decoded;
    },
    Paginator(message, embeds, footer) {
        if (!message.interaction) {
            let person = message.author;
            let currentPage = 0;
            let firstEmbed = embeds[currentPage].setFooter(`${footer} | Page ${currentPage + 1}/${embeds.length}`, person.displayAvatarURL({ format: "png", dynamic: true }));
            if (!embeds.length)
                return console.error(`${embeds.length} embeds given`);
            message.channel.send(firstEmbed).then(message => {
                message.react("⏪");
                message.react("◀️");
                message.react("▶️");
                message.react("⏩");
                const filter = (reaction, user) => ["⏪", "◀️", "▶️", "⏩"].includes(reaction.emoji.name) &&
                    user.id === person.id;
                const collector = message.createReactionCollector(filter, {
                    time: 10000000
                });
                collector.on("collect", reaction => {
                    if (reaction.emoji.name === "▶️") {
                        if (currentPage < embeds.length - 1) {
                            currentPage++;
                            console.log(embeds[currentPage]);
                            const newMan = embeds[currentPage].setFooter(`${footer} | Page ${currentPage + 1}/${embeds.length}`, person.displayAvatarURL({ format: "png", dynamic: true }));
                            message.edit(newMan);
                        }
                    }
                    else if (reaction.emoji.name === "◀️") {
                        if (currentPage !== 0) {
                            currentPage--;
                            const newMan = embeds[currentPage].setFooter(`${footer} | Page ${currentPage + 1}/${embeds.length}`, person.displayAvatarURL({ format: "png", dynamic: true }));
                            message.edit(newMan);
                        }
                    }
                    else if (reaction.emoji.name === "⏪") {
                        currentPage = 0;
                        const newMan = embeds[currentPage].setFooter(`${footer} | Page 1/${embeds.length}`, person.displayAvatarURL({ format: "png", dynamic: true }));
                        message.edit(newMan);
                    }
                    else if (reaction.emoji.name === "⏩") {
                        currentPage = embeds.length - 1;
                        const newMan = embeds[currentPage].setFooter(`${footer} | Page ${embeds.length}/${embeds.length}`, person.displayAvatarURL({ format: "png", dynamic: true }));
                        message.edit(newMan);
                    }
                });
            });
        }
    }
});
//# sourceMappingURL=botMisc.js.map