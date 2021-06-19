"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const statSchema = new mongoose_1.Schema({
    vidUrl: String,
    title: String,
    aniTitle: String,
    timestamp: Date
});
exports.default = mongoose_1.model("epVideos", statSchema);
//# sourceMappingURL=Vids.js.map