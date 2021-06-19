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
Object.defineProperty(exports, "__esModule", { value: true });
const funi = require("./funix.js");
const utils_1 = require("../utils");
const constants_1 = require("./constants");
class Funimation {
    constructor(id, Bobb, ops) {
        this.config = Object.assign(Object.assign({}, constants_1.funiOptions), ops);
        this.id = id;
        this.Bobb = Bobb;
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            yield funi.auth();
        });
    }
    search(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!query)
                return { success: false, error: "Input a search title." };
            let findShow = yield funi.searchShow({ query: query });
            if (findShow.success == false) {
                return {
                    success: false,
                    error: findShow.error
                };
            }
            let searchRet = findShow.map((el, ind) => `${utils_1.ordinate(ind + 1)} - ${el.title} … ${el.id}`);
            this.searchRes = searchRet;
            return { success: true, res: searchRet };
        });
    }
    choose(choice) {
        choice = choice.toString();
        if (!this.searchRes)
            return { success: false, error: "Please search for an anime first." };
        let ind;
        if (choice.slice(-2).match(/st|nd|rd|th/g)) {
            ind = parseInt(choice.slice(0, -2))
                ? parseInt(choice.slice(0, -2))
                : false;
            if (!ind ||
                !this.searchRes[ind - 1] ||
                !this.searchRes.find((i) => i.split(" - ")[0] === choice))
                return {
                    success: false,
                    error: "Make sure the ordinal id input is correct!"
                };
            this.choiceID = this.searchRes[ind - 1].split(" … ")[1];
            this.choiceTitle = this.searchRes[ind - 1]
                .split(" … ")[0]
                .split(" - ")[1];
            return { success: true, res: this.choiceID };
        }
        else if (typeof parseInt(choice) === "number") {
            ind = parseInt(choice);
            if (!ind || !this.searchRes[ind - 1])
                return { success: false, error: "Make sure the  id input is correct!" };
            this.choiceID = this.searchRes[ind - 1].split(" … ")[1];
            this.choiceTitle = this.searchRes[ind - 1]
                .split(" … ")[0]
                .split(" - ")[1];
            return { success: true, res: this.choiceID };
        }
        return { success: false, error: `Bad input. ${choice}` };
    }
    getEp(ep, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ep || (!parseInt(ep) && ep !== "latest"))
                return {
                    success: false,
                    error: 'Please provide an episode. Choices: "latest" or "1,2 or 1-2 or 1"'
                };
            console.log(message);
            let m = (message === null || message === void 0 ? void 0 : message.commandName)
                ? message
                : yield message.channel.send("Progress...");
            const getShow = yield funi.getShow(this.Bobb, m, this.choiceID, ep, this.config);
            if (!getShow || !getShow.epMedia) {
                return {
                    success: false,
                    error: "There was an error fetching selected episode(s)"
                };
            }
            let errs = [];
            for (let ep in getShow.epMedia) {
                if (getShow.epMedia[ep].vData.success === false) {
                    errs.push(`Episode ${ep}: ${getShow.epMedia[ep].vData.error}`);
                    getShow.success = false;
                }
            }
            if (errs.length)
                return { success: false, error: errs.join("\n") };
            return { success: true, res: getShow, message: m };
        });
    }
}
exports.default = Funimation;
//# sourceMappingURL=funiClass.js.map