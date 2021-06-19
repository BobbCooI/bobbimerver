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
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.Schema({
    username: { type: String },
    loweruser: { type: String },
    userID: { type: String },
    email: { type: String },
    ePassword: { type: String },
    hPassword: { type: String },
    UUID: { type: String },
    dateCreate: { type: Date },
    episodesFetched: { type: Number },
    animeTitlesViewed: { type: Array },
    animesWatch: { type: Array },
    animeEpisodes: { type: Array },
    verified: { type: Boolean },
    discTag: { type: String },
    discID: { type: String },
    cmdSpam: { type: Number },
    cmdsRan: { type: Number },
    lastCmd: { type: Date }
});
userSchema.pre("save", function (next) {
    var user = this;
    if (!user.isModified("hPassword"))
        return next();
    bcrypt_1.default.genSalt(parseInt(process.env.saltFactor) || 6, function (err, salt) {
        if (err)
            return next(err);
        bcrypt_1.default.hash(user.hPassword, salt, function (err, hash) {
            if (err)
                return next(err);
            user.hPassword = hash;
            next();
        });
    });
});
userSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(password, this.hPassword);
    });
};
exports.default = mongoose_1.model("user", userSchema);
//# sourceMappingURL=Person.js.map