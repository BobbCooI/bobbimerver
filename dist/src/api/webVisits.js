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
const Stats_1 = __importDefault(require("../db/models/Stats"));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body["increment"]) {
        yield Stats_1.default.updateOne({ _id: "60070be0f12d9e041931de68" }, { $inc: { websiteVisits: 1 } });
        return res.json({ successful: true });
    }
    else if (req.body["getVisits"]) {
        let visitCount = yield Stats_1.default.findOne({ _id: "60070be0f12d9e041931de68" }).catch((e) => console.log(e));
        return res.json({ visitCount: visitCount.websiteVisits });
    }
    else
        return res.send("why u here");
}));
router.get("/", (_req, res) => {
    res.send("why u here");
});
exports.default = router;
//# sourceMappingURL=webVisits.js.map