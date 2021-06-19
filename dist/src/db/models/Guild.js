"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const guildSchema = new mongoose_1.Schema({
    guild: { type: String, required: true },
    guildID: { type: String, required: true },
    prefix: { type: String, default: "a!" },
    disabledCategories: { type: Array, default: [] },
    disabledCommands: { type: Array, default: [] },
    enabledCommands: { type: Array, default: [] }
});
exports.default = mongoose_1.model("Guild", guildSchema);
//# sourceMappingURL=Guild.js.map