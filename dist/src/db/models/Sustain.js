"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const sustainSchema = new mongoose_1.Schema({
    reqLink: String,
    reqHash: String,
    aniID: String,
    updHash: String
});
exports.default = mongoose_1.model("Sustain", sustainSchema);
//# sourceMappingURL=Sustain.js.map