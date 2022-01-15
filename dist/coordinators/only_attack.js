"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dummy_spawn_1 = __importDefault(require("../strategies/dummy_spawn"));
const dummy_attack_1 = __importDefault(require("../strategies/dummy_attack"));
const getStrategies = () => [dummy_spawn_1.default, dummy_attack_1.default];
exports.default = getStrategies;
//# sourceMappingURL=only_attack.js.map