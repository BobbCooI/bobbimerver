"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/', (req, res) => {
    var _a, _b;
    const { body } = req.body;
    if (!body.anime_title)
        return res.send({ successful: false, error: "No anime title received." });
    if (!((_a = body.ep) === null || _a === void 0 ? void 0 : _a.title) || !((_b = body.ep) === null || _b === void 0 ? void 0 : _b.number))
        return res.send({ successful: false, error: "No episode title or number received." });
    console.log(body);
    return res.send({ successful: false, error: "Unknown" });
});
router.get('/', (_req, res) => {
    res.send("You are not supposed to be here nor log a watch here 🤨");
});
exports.default = router;
//# sourceMappingURL=logwatch.js.map