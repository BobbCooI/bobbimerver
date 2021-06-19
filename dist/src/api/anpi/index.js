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
const secret_1 = __importDefault(require("../secret"));
const utils_1 = require("../../utils/utils");
router.use("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const apiKey = req.get(process.env.headerAni);
    const authHeader = req.get("Authorization");
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null)
        return res.send({ success: false, error: "Unauthorized..." });
    try {
        let isAuth = yield utils_1.verify(token);
        if (secret_1.default.has(apiKey) && isAuth) {
            next();
            return;
        }
        else {
            return res.json({ success: false, error: "You are not authorized.." });
        }
    }
    catch (e) {
        return res.send({
            success: false,
            error: "Session has expired.",
            logout: true
        });
    }
}), (_req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        next();
        return;
    }
    catch (error) {
        return { success: false, error: error.message || error.error };
    }
}));
const gogo_1 = __importDefault(require("./gogo"));
const geteps_1 = __importDefault(require("./geteps"));
router.use("/gogo", gogo_1.default);
router.use("/geteps", geteps_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map