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
class MessageCollector {
    constructor(bot) {
        this.collectors = {};
        bot.on('message', this.verify.bind(this));
    }
    verify(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const collector = this.collectors[msg.channel.id + msg.author.id];
            if (collector && collector.filter(msg)) {
                collector.resolve(msg);
            }
        });
    }
    awaitMessage(channelID, userID, timeout, filter = () => true) {
        return new Promise(resolve => {
            if (this.collectors[channelID + userID]) {
                delete this.collectors[channelID + userID];
            }
            this.collectors[channelID + userID] = { resolve, filter };
            setTimeout(resolve.bind(null, false), timeout);
        });
    }
}
exports.default = MessageCollector;
;
//# sourceMappingURL=messageCollector.js.map