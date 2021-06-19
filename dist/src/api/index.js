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
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const secret_1 = __importDefault(require("./secret"));
router.use("/", (req, res, next) => {
    const apiKey = req.get(process.env.headerAuth);
    if (!secret_1.default.has(apiKey)) {
        return res.send({ success: false, error: "Invalid API Key." });
    }
    next();
    return;
}, (_req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        next();
    }
    catch (error) {
        return { success: false, error };
    }
}));
const anpi_1 = __importDefault(require("./anpi"));
const discord_1 = __importDefault(require("./discord"));
const webVisits_1 = __importDefault(require("./webVisits"));
const auth_1 = __importDefault(require("./auth"));
router.use("/ani", anpi_1.default);
router.use("/discord", discord_1.default);
router.use("/visits", webVisits_1.default);
router.use("/auth", auth_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map