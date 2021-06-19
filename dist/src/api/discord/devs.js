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
exports.getDevs = void 0;
const axios_1 = __importDefault(require("axios"));
function getDevs(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userDiscApi = axios_1.default.create({
            baseURL: `https://discord.com/api/v8/users/`,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bot ${process.env.botToken}`
            }
        });
        let re = yield Promise.all(req.body["developers"].map((dev) => __awaiter(this, void 0, void 0, function* () { return (yield userDiscApi.get(dev)).data; }))).catch((e) => console.log(e));
        let ret = re ? { success: true, developers: re } : { success: false };
        return res.send(ret);
    });
}
exports.getDevs = getDevs;
//# sourceMappingURL=devs.js.map