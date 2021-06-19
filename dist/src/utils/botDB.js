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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (Bobb) => ({
    fetchMemberInfo(search) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Bobb.mongo.Person.findOne(search).catch((e) => Bobb.loggers.log(e.stack.length < 1990 ? e.stack : e.message + "function: fetchMemberInfo", "error"));
        });
    },
    updateMember(search, update) {
        return __awaiter(this, void 0, void 0, function* () {
            let ok = yield Bobb.mongo.Person.findOneAndUpdate(search, update, { new: true }).catch((e) => Bobb.loggers.log(e.stack.length < 1990 ? e.stack : e.message + "function: updateMember", "error"));
            return ok;
        });
    },
    updateBal(memberID, amt) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.updateMember({ discID: memberID }, { $inc: { balance: amt } }).catch((e) => Bobb.loggers.log(e.stack.length < 1990 ? e.stack : e.message + "function: updateBal->updateMember->findOneAndUpdate Person", "error"));
        });
    },
    createGuild(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Bobb.mongo.Guild.create({
                guild: guild.name,
                guildID: guild.id
            });
            return yield Bobb.botStats.findOneAndUpdate({ _id: "60070be0f12d9e041931de68" }, { $inc: { guildsJoined: 1 } }, { new: true }).catch((e) => Bobb.loggers.log(e.stack.length < 1990 ? e.stack : e.message + "function: createGuild->findOneAndUpdate Stats", "error"));
        });
    },
    deleteGuild(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Bobb.mongo.Guild.findOneAndDelete({ guildID: guild.id }).catch((e) => Bobb.loggers.log(e.stack.length < 1990 ? e.stack : e.message + "function: deleteGuild->findOneAndDelete guild", "error"));
            return yield Bobb.botStats.findOneAndUpdate({ _id: "60070be0f12d9e041931de68" }, { $inc: { guildsLeft: 1 } }, { new: true }).catch((e) => Bobb.loggers.log(e.stack.length < 1990 ? e.stack : e.message + "function: deleteGuild->findOneAndUpdate Stats", "error"));
        });
    },
    getGuild(id, update) {
        return __awaiter(this, void 0, void 0, function* () {
            return id && !update ? yield Bobb.mongo.Guild.findOne({ guildID: id }).catch((e) => console.log(e)) : yield Bobb.mongo.Guild.findOneAndUpdate({ guildID: id }, update, { new: true }).catch((e) => Bobb.loggers.log(e.stack.length < 1990 ? e.stack : e.message + "function: getGuild->findOne", "error"));
        });
    },
    updateCooldowns(command, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const pCommand = Bobb.cmds.find(c => c.props.triggers.includes(command.toLowerCase()));
            if (!pCommand) {
                return;
            }
            let cooldown = pCommand.props.cooldown;
            const profile = yield this.getCooldowns(userID, false);
            if (!profile) {
                return this.createCooldowns(command, userID);
            }
            if (profile.cooldowns.some((cmd) => cmd[command])) {
                profile.cooldowns.forEach((cmd) => {
                    if (cmd[command]) {
                        cmd[command] = Date.now() + cooldown;
                    }
                });
            }
            else {
                profile.cooldowns.push({ [command]: Date.now() + cooldown });
            }
            if (cooldown) {
                return Bobb.cooldowns.set(userID, {
                    id: userID,
                    cooldowns: profile.cooldowns
                });
            }
        });
    },
    createCooldowns(command, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const pCommand = Bobb.cmds.find(c => c.props.triggers.includes(command.toLowerCase()));
            if (!pCommand) {
                return;
            }
            const cooldown = pCommand.props.cooldown;
            if (cooldown) {
                return Bobb.cooldowns.set(userID, {
                    id: userID,
                    cooldowns: [{ [command]: Date.now() + cooldown }]
                });
            }
            else {
                return console.error(`No cooldown for following command: ${pCommand}`);
            }
        });
    },
    getCooldowns(userID, type) {
        let all = type === "all";
        if (all || type !== "db") {
            const cooldown = Bobb.cooldowns.get(userID) || {
                cooldowns: [],
                id: userID
            };
            if (!all) {
                return cooldown;
            }
            else {
                all = cooldown;
            }
        }
        return all;
    },
    deleteCooldowns(userID) {
        Bobb.cooldowns.delete(userID);
    },
    getSpecificCooldown(command, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = Bobb.cooldowns.get(userID);
            if (!profile) {
                return null;
            }
            const cooldowns = profile.cooldowns.find((item) => item[command.triggers[0]]);
            if (!cooldowns) {
                return null;
            }
            return profile.cooldowns.find((item) => item[command.triggers[0]])[command.triggers[0]];
        });
    },
    addSpam(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateMember({ discID: id }, { $inc: { cmdSpam: 1 } });
        });
    }
});
//# sourceMappingURL=botDB.js.map