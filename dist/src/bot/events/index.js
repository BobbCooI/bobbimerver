"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const listeners = fs_1.default.readdirSync(__dirname)
    .filter(l => l !== 'index.js' && l !== "index.ts" && !l.endsWith(".map"))
    .map(l => l.split('.')[0]);
exports.default = listeners;
//# sourceMappingURL=index.js.map