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
exports.emailCheck = exports.userCheck = exports.login = exports.register = void 0;
const Person_1 = __importDefault(require("../../db/models/Person"));
const utils_1 = require("../../utils/utils");
const Stats_1 = __importDefault(require("../../db/models/Stats"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function jwtSignUser(user) {
    const threeDays = 60 * 60 * 24 * 3;
    return jsonwebtoken_1.default.sign(user, process.env.jwtAccessSecret, {
        expiresIn: threeDays
    });
}
;
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { pUsername } = req.body;
        const userCheck = yield Person_1.default.findOne({
            loweruser: pUsername.toLowerCase()
        });
        if (userCheck)
            return res.send({
                success: false,
                error: "This username is already in use."
            });
        const email = req.body.pEmail;
        const emailCheck = yield Person_1.default.findOne({
            email
        });
        if (emailCheck)
            return res.send({
                success: false,
                error: "This email account is already in use."
            });
        let origPass = req.body.pPassword
            ? utils_1.decode64(req.body.pPassword).toString()
            : res.send({ success: false, error: "Password is needed." });
        let iD;
        let ePassword = crypto_js_1.default.AES.encrypt(origPass, process.env.encryptWord).toString();
        do {
            iD = utils_1.makeID(8);
        } while (yield Person_1.default.findOne({ userID: iD }));
        const user = yield Person_1.default.create({
            username: req.body.pUsername,
            loweruser: req.body.pUsername.toLowerCase(),
            userID: iD,
            email: req.body.pEmail.toLowerCase(),
            ePassword,
            hPassword: origPass,
            UUID: utils_1.generateUUID(),
            verified: false,
            dateCreate: new Date()
        });
        yield Stats_1.default.findOneAndUpdate({ _id: "60070be0f12d9e041931de68" }, { $inc: { usersCreated: 1 } }, { new: true });
        if (!user)
            return res.send({
                success: false,
                error: "Internal server error. Please report to developer."
            });
        return res.send({
            success: true
        });
    });
}
exports.register = register;
;
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { pUsername } = req.body;
            let password = req.body.pPassword
                ? utils_1.decode64(req.body.pPassword).toString()
                : res.send({ success: false, error: "Password is needed." });
            const user = yield Person_1.default.findOne({
                loweruser: pUsername.toLowerCase()
            }).catch(e => console.log(e));
            if (!user)
                return res.send({
                    success: false,
                    error: "The login information was incorrect"
                });
            const isPassCorrect = yield user
                .comparePassword(password)
                .catch(e => console.log(e));
            if (!isPassCorrect) {
                return res.send({
                    success: false,
                    error: "The login information was incorrect"
                });
            }
            let userJson = user.toJSON();
            userJson = {
                username: userJson.username,
                userID: userJson.userID,
                UUID: userJson.UUID
            };
            return res.send({
                success: true,
                userInfo: userJson,
                token: jwtSignUser(userJson)
            });
        }
        catch (err) {
            console.log(err);
            return res.send({
                success: false,
                error: "An error has occured trying to log in"
            });
        }
    });
}
exports.login = login;
;
function userCheck(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { pUsername } = req.body;
        const posib = yield Person_1.default.findOne({ loweruser: pUsername.toLowerCase() });
        if (posib) {
            return res.send({ good: false });
        }
        else {
            return res.send({ good: true });
        }
    });
}
exports.userCheck = userCheck;
;
function emailCheck(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Stats_1.default.updateOne({ _id: "60070be0f12d9e041931de68" }, { $inc: { webRequests: 1 } });
        const { pEmail } = req.body;
        const posib = yield Person_1.default.findOne({ email: pEmail.toLowerCase() });
        if (posib) {
            return res.send({ good: false });
        }
        else {
            return res.send({ good: true });
        }
    });
}
exports.emailCheck = emailCheck;
;
//# sourceMappingURL=authControl.js.map