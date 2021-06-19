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
const discord_js_1 = __importDefault(require("discord.js"));
exports.default = (Bobb) => ({
    logReady(message, name = 'log') {
        return __awaiter(this, void 0, void 0, function* () {
            const date = Date().toString().split(' ').slice(1, 5).join(' ');
            let chan = yield Bobb.client.channels.fetch('793650413865009152');
            let embed = new discord_js_1.default.MessageEmbed()
                .setTitle(name)
                .addField(`[${date}]`, message, false)
                .setTimestamp()
                .setColor('ORANGE');
            yield chan.send({ embeds: [embed] }).catch((e) => console.log("message:", message, "\nerror:", e.message));
        });
    },
    log(message, name = 'log') {
        return __awaiter(this, void 0, void 0, function* () {
            const date = Date().toString().split(' ').slice(1, 5).join(' ');
            let chan = yield Bobb.client.channels.fetch('795760207761768499');
            let msg = `${name}
  [${date}]
  ${message}`;
            yield chan.send({ content: msg }).catch((e) => console.log("message:", message, "\nerror:", e.message));
        });
    },
    cacheMessage(embed) {
        return __awaiter(this, void 0, void 0, function* () {
            let cacheChannel = yield Bobb.client.channels.fetch('847249762453159937');
            yield cacheChannel.send({ embeds: [embed] }).catch((e) => console.log("error caching a message..", e, "embed:", embed));
        });
    },
    reportError(e, message, command) {
        return __awaiter(this, void 0, void 0, function* () {
            let date = new Date();
            let shardID = message.guild ? message.guild.shard.id : "DM";
            let guildID = message.guild ? message.guild.id : "DM " + message.channel.id;
            yield Bobb.botStats.updateOne({ _id: "60070be0f12d9e041931de68" }, { $inc: { errReported: 1 } });
            let msg = yield Bobb.misc.errorMessages(e.toString());
            let randNum = Math.floor(Math.random() * 99999);
            const channel = "795760207761768499";
            if (!msg) {
                message.channel.send(`Something went wrong lol\nError: \`${command.props.triggers[0]}.1.${shardID}.${date.getHours()}:${date.getMinutes()}.err${randNum}\``);
                const errChan = yield Bobb.client.channels.fetch(channel);
                errChan.send(`**Error: ${e.message}**\nCode: \`err${randNum}\`\nCommand Ran: ${command.props.triggers[0]}\nDate: ${date.toLocaleTimeString("en-US")}\nSupplied arguments: ${message.content.split(/ +/g)}\nServer ID: ${guildID}\nCluster "idk"
         | Shard ${shardID}\n\`\`\` ${e.stack || e} \`\`\``);
                yield exports.default(Bobb).log(`Command error:\n\tCommand: ${command.props.triggers[0]}\n\tSupplied arguments: ${message.content.split(/ +/g)}\n\tServer ID: ${guildID}\n\tError: ${e.stack}`, "error");
            }
            else {
                message.channel.send(msg);
            }
        });
    }
});
//# sourceMappingURL=logger.js.map