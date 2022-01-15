"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const random_1 = __importDefault(require("../strategies/random"));
const spawn_1 = __importDefault(require("../strategies/spawn"));
const getStrategies = () => [spawn_1.default, random_1.default];
exports.default = getStrategies;
//# sourceMappingURL=dummy.js.map