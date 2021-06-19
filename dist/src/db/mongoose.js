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
const mongoose_1 = __importDefault(require("mongoose"));
exports.default = {
    connector() {
        return __awaiter(this, void 0, void 0, function* () {
            const dbOptions = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                autoIndex: false,
                poolSize: 5,
                connectTimeoutMS: 10000,
                family: 4
            };
            yield mongoose_1.default.connect(process.env.mongoPass, dbOptions);
            mongoose_1.default.set("useFindAndModify", false);
            mongoose_1.default.Promise = global.Promise;
            mongoose_1.default.connection.on("connected", () => {
                console.log("Mongoose has successfully connected!");
            });
            mongoose_1.default.connection.on("err", (err) => {
                console.error(`Mongoose connection error: \n${err.stack}`);
            });
            mongoose_1.default.connection.on("disconnected", () => {
                console.warn("Mongoose connection lost");
            });
        });
    }
};
//# sourceMappingURL=mongoose.js.map