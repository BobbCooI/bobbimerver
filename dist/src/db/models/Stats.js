"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const statSchema = new mongoose_1.Schema({
    usersCreated: { type: Number, default: 0 },
    usersVerified: { type: Number, default: 0 },
    messages: { type: Number, default: 0 },
    commands: { type: Number, default: 0 },
    slashCommands: { type: Number, default: 0 },
    guildsJoined: { type: Number, default: 0 },
    guildsLeft: { type: Number, default: 0 },
    errReported: { type: Number, default: 0 },
    err: { type: Number, default: 0 },
    websiteVisits: { type: Number, default: 0 },
    webRequests: { type: Number, default: 0 },
    episodesFetched: { type: Number, default: 0 }
});
exports.default = mongoose_1.model("botStats", statSchema);
//# sourceMappingURL=Stats.js.map