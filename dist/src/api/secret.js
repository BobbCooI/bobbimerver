"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiKeys = new Map();
apiKeys.set(process.env.headerSecret, true);
apiKeys.set(process.env.headerAniSecret, true);
exports.default = apiKeys;
//# sourceMappingURL=secret.js.map