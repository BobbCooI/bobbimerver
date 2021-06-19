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
const gogo_1 = __importDefault(require("../../utils/scrapers/gogo"));
const utils_1 = require("../../utils/utils");
const lodash_1 = __importDefault(require("lodash"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const Stats_1 = __importDefault(require("../../db/models/Stats"));
const Person_1 = __importDefault(require("../../db/models/Person"));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    console.log(req.cookies);
    if (req.body.gg) {
        try {
            let link = yield gogo_1.default(req.body.gg);
            if (link)
                return res.send({ success: true, link });
        }
        catch (e) {
            return res.send({ success: false, error: e });
        }
    }
    else if (req.body.bb) {
        try {
            if (!((_a = req.body) === null || _a === void 0 ? void 0 : _a.uuid))
                throw new Error("Please log in first.");
            let title = utils_1.decode64(req.body.bb);
            switch (title) {
                case "Black Clover":
                    title = "Black Clover TV";
                    break;
                case "Ansatsu Kyoushitsu":
                    if (parseInt(req.body.epMeta.num) > 1)
                        title = "Ansatsu Kyoushitsu TV-";
                    break;
                case "Ansatsu Kyoushitsu 2nd Season":
                    if (parseInt(req.body.epMeta.num) >= 1)
                        title = "Ansatsu Kyoushitsu TV 2nd Season";
                    break;
            }
            const slugifiedTitle = utils_1.slugify(title);
            let slugTitle = `https://gogo-play.net/videos/${slugifiedTitle}-episode-${utils_1.slugify(req.body.epMeta.num)}`;
            console.log("Gogo slug url title:", slugTitle);
            let link = yield gogo_1.default(slugTitle);
            if (link) {
                let addToSet = {};
                let userInfo = yield Person_1.default.findOne({ UUID: req.body.uuid });
                if (!userInfo)
                    throw new Error("user not found.. have you registered properly? if you have, please contact Bobb#3350 on discord about this!..");
                let isInDB = (_b = userInfo.animesWatch) === null || _b === void 0 ? void 0 : _b.find(t => (t === null || t === void 0 ? void 0 : t.title) == title);
                if (!isInDB) {
                    addToSet = {
                        animesWatch: {
                            title,
                            episodeCount: req.body.epCount,
                            rating: req.body.rating || 0,
                            start: new Date(),
                            episodes: [
                                {
                                    aniTitle: title,
                                    title: req.body.epMeta.title,
                                    num: parseInt(req.body.epMeta.num),
                                    timeBegan: new Date(),
                                    finished: false
                                }
                            ]
                        }
                    };
                }
                else {
                    let anindex = lodash_1.default.findIndex(userInfo.animesWatch, (t) => t.title == title);
                    let mongodex = `animesWatch.${anindex}.episodes`;
                    let epInDb = (_c = userInfo.animesWatch) === null || _c === void 0 ? void 0 : _c[anindex].episodes.find((ep) => ep.aniTitle == title);
                    if (!epInDb)
                        addToSet = {
                            [mongodex]: {
                                aniTitle: title,
                                title: req.body.epMeta.title,
                                num: parseInt(req.body.epMeta.num),
                                timeBegan: new Date(),
                                finished: false
                            }
                        };
                    if (Object.keys(addToSet)[0].includes("-1"))
                        addToSet = {};
                }
                console.log("addtoset", addToSet);
                let ff = yield Person_1.default.findOneAndUpdate({ UUID: req.body.uuid }, { $inc: { episodesFetched: 1 }, $addToSet: addToSet }, { new: true }).catch(e => console.log(e));
                console.log(ff);
                yield Stats_1.default.updateOne({ _id: "60070be0f12d9e041931de68" }, { $inc: { episodesFetched: 1 } });
                return res.send({
                    success: true,
                    main: link.link
                });
            }
            else
                throw "Unknown error while fetching the stream.";
        }
        catch (e) {
            console.log(e);
            return res.send({
                success: false,
                error: e.error || e.message || "There was an error fetching that episode."
            });
        }
    }
    else {
        return res.send("why are you here");
    }
    return res.send({ success: false, error: "🤨" });
}));
exports.default = router;
//# sourceMappingURL=gogo.js.map