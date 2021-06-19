var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const EventEmitter = require("events");
class IPC extends EventEmitter {
    constructor() {
        super();
        this.events = new Map();
        process.on("message", msg => {
            let event = this.events.get(msg._eventName);
            if (event) {
                event.fn(msg);
            }
        });
    }
    register(event, callback) {
        this.events.set(event, { fn: callback });
    }
    unregister(name) {
        this.events.delete(name);
    }
    broadcast(name, message = {}) {
        message._eventName = name;
        process.send({ name: "broadcast", msg: message });
    }
    sendTo(cluster, name, message = {}) {
        message._eventName = name;
        process.send({ name: "send", cluster: cluster, msg: message });
    }
    fetchUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            process.send({ name: "fetchUser", id });
            return new Promise((resolve, reject) => {
                const callback = user => {
                    this.removeListener(id, callback);
                    resolve(user);
                };
                this.on(id, callback);
            });
        });
    }
    fetchGuild(id) {
        return __awaiter(this, void 0, void 0, function* () {
            process.send({ name: "fetchGuild", id });
            return new Promise((resolve, reject) => {
                const callback = guild => {
                    this.removeListener(id, callback);
                    resolve(guild);
                };
                this.on(id, callback);
            });
        });
    }
    fetchChannel(id) {
        return __awaiter(this, void 0, void 0, function* () {
            process.send({ name: "fetchChannel", id });
            return new Promise((resolve, reject) => {
                const callback = channel => {
                    this.removeListener(id, callback);
                    resolve(channel);
                };
                this.on(id, callback);
            });
        });
    }
    fetchMember(guildID, memberID) {
        return __awaiter(this, void 0, void 0, function* () {
            process.send({ name: "fetchMember", guildID, memberID });
            return new Promise((resolve, reject) => {
                const callback = channel => {
                    this.removeListener(memberID, callback);
                    resolve(channel);
                };
                this.on(memberID, callback);
            });
        });
    }
}
module.exports = IPC;
//# sourceMappingURL=IPC.js.map