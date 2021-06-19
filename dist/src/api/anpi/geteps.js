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
const axios_1 = __importDefault(require("axios"));
const Sustain_1 = __importDefault(require("../../db/models/Sustain"));
const utils_1 = require("../../utils/utils");
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.pages && req.body.id) {
        try {
            let eps = [];
            let malID = req.body.id;
            for (let i = 1; i <= req.body.pages; i++) {
                let link = `https://api.jikan.moe/v3/anime/${malID}/episodes/${i}`;
                if (req.body.airing) {
                    if (i == req.body.pages) {
                        let posib = yield Sustain_1.default.findOne({ reqLink: link });
                        if (posib) {
                            let isUpdated = yield axios_1.default.get(link, {
                                headers: { "If-None-Match": posib.reqHash }
                            });
                            if (isUpdated.status == 304) {
                                let list = yield axios_1.default.get(link);
                                eps.push(...list.data.episodes);
                            }
                            else if (isUpdated.status == 200) {
                                yield Sustain_1.default.updateOne({ reqLink: link }, { updHash: isUpdated.headers["ETag"] }, { upsert: true });
                                eps.push(...isUpdated.data.episodes);
                            }
                        }
                        else {
                            let list = yield axios_1.default.get(link);
                            let reqHash = list.data.request_hash;
                            let updHash = list.headers["ETag"];
                            yield Sustain_1.default.create({
                                reqHash,
                                updHash,
                                reqLink: link,
                                aniID: malID
                            });
                            eps.push(...list.data.episodes);
                        }
                    }
                    else {
                        let list = yield axios_1.default.get(link);
                        eps.push(...list.data.episodes);
                    }
                }
                else {
                    let list = yield axios_1.default.get(link);
                    let reqHash = list.data.request_hash;
                    let updHash = list.headers["ETag"];
                    yield Sustain_1.default.updateOne({ reqLink: link }, {
                        reqHash,
                        updHash
                    }, { upsert: true });
                    eps.push(...list.data.episodes);
                }
            }
            let selectedEpTitles = [];
            eps = eps.filter((ep, index) => ep.aired
                ? Date.now() - new Date(ep.aired).getTime() > 0
                : eps[index + 1] ||
                    (isValidDate(new Date(eps[index - 1] && eps[index - 1].aired)) &&
                        Date.now() -
                            new Date(eps[index - 1] && eps[index - 1].aired).setDate(new Date(eps[index - 1].aired).getDate() + 7) >
                            0));
            eps.forEach(((ep) => (selectedEpTitles[ep.episode_id - 1] = ep.title)));
            return res.send({
                success: true,
                epTitles: selectedEpTitles,
                episodes: eps
            });
        }
        catch (e) {
            console.log(e.message);
            yield utils_1.createWebhook({
                embedContent: (e.stack.length < 1980 && e.stack) || e.message,
                type: "error"
            });
            return res.send({ success: false, error: e.message });
        }
    }
    else
        res.send({ success: false, error: "invalid.." });
    return res.send({ success: false, error: "invalid.." });
}));
router.get("/geteps", (_req, res) => {
    res.send({ success: true, res: "but y u here" });
});
exports.default = router;
function isValidDate(d) {
    return d instanceof Date && (d.toString() !== "Invalid Date");
}
//# sourceMappingURL=geteps.js.map