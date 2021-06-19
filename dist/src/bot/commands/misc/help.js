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
const GenericCommand_1 = __importDefault(require("../../commandTypes/GenericCommand"));
const discord_js_1 = __importDefault(require("discord.js"));
exports.default = new GenericCommand_1.default({
    triggers: ["help", "he", "h"],
    usage: "{command} <commandName>",
    bypass: true,
    description: "See all the commands",
    slashCmd: true,
    slashOpts: {
        name: "help",
        description: "See all the commands or find out how to use a specific command.",
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
}, ({ Bobb, args, addCD }) => __awaiter(void 0, void 0, void 0, function* () {
    addCD();
    if (args === null || args === void 0 ? void 0 : args[0]) {
        let command = Bobb.cmds.find((c) => { var _a; return c.props.triggers.includes((_a = args === null || args === void 0 ? void 0 : args[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase()); });
        if (!command)
            return "I could not find that command. Try running the `help` command by itself and see a list of commands.";
        const embed = new discord_js_1.default.MessageEmbed()
            .setTitle(`Information on ${Bobb.misc.capitalize(command.props.triggers[0])}`)
            .setDescription(`Triggers: ${command.props.triggers.join(" | ")}`)
            .addField("Usage: ", `${command.props.usage}`, true)
            .addField("Description: ", command.props.description, true)
            .setTimestamp()
            .setFooter(":)");
        let ret = new Bobb.Return("message");
        ret.setEmbeds([embed]);
        return ret;
    }
    else {
        let allCommands = Bobb.cmds.map((c) => `**${c.props.triggers[0]}** - Category: ${c.category}`);
        const embed = new discord_js_1.default.MessageEmbed()
            .setTitle("Commands")
            .setDescription(allCommands.join("\n"))
            .setTimestamp()
            .setFooter(":)");
        let ret = new Bobb.Return("message");
        ret.setEmbeds([embed]);
        return ret;
    }
}), ({ Bobb, argslash, addCD }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    addCD();
    if ((_a = argslash.get("command")) === null || _a === void 0 ? void 0 : _a.value) {
        let command = Bobb.cmds.find((c) => { var _a; return c.props.triggers.includes(((_a = argslash.get("command")) === null || _a === void 0 ? void 0 : _a.value).toLowerCase()); });
        if (!command)
            return "I could not find that command. Try running the `help` command by itself and see a list of commands.";
        const embed = new discord_js_1.default.MessageEmbed()
            .setTitle(`Information on ${Bobb.misc.capitalize(command.props.triggers[0])}`)
            .setDescription(`Triggers: ${command.props.triggers.join(" | ")}`)
            .addField("Usage: ", `${command.props.usage}`, true)
            .setTimestamp()
            .setFooter(":)");
        if (command.props.description)
            embed.addField("Description: ", command.props.description, true);
        let Ret = new Bobb.Return("message");
        Ret.setEmbeds([embed]);
        return Ret;
    }
    else {
        let allCommands = Bobb.cmds.map((c) => `**${c.props.triggers[0]}** - Category: ${c.category}`);
        const embed = new discord_js_1.default.MessageEmbed()
            .setTitle("Commands")
            .setDescription(allCommands.join("\n"))
            .setTimestamp()
            .setFooter(":)");
        let Ret = new Bobb.Return("message");
        Ret.setEmbeds([embed]);
        return Ret;
    }
}));
//# sourceMappingURL=help.js.map