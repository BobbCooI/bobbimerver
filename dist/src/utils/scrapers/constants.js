"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vrvOptions = exports.crOptions = exports.funiOptions = void 0;
const funiOptions = {
    quality: 10,
    server: 1,
    suffix: "SIZEp",
    releaser: "Funimation",
    novids: true,
    mp4: true,
    mks: true,
    enSub: true
};
exports.funiOptions = funiOptions;
const crOptions = {
    user: process.env.crEmail,
    pass: process.env.crPass,
    quality: "max",
    server: 1,
    suffix: "SIZEp",
    grouptag: "CR",
    debug: true,
    mp4: true,
    dlsubs: "enUS",
    hslang: "enUS",
    ssu: true,
    skipmux: true,
    skipdl: true,
    skipsubs: false,
    pagemsgs: true,
    filename: "[{rel_group}] {title} - {ep_num} [{suffix}]"
};
exports.crOptions = crOptions;
const vrvOptions = {
    email: process.env.vrvEmail,
    password: process.env.vrvPass,
    lang: "enUS",
    debug: false
};
exports.vrvOptions = vrvOptions;
//# sourceMappingURL=constants.js.map