"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spawn_closest_to_diamond_1 = __importDefault(require("../strategies/spawn_closest_to_diamond"));
const grab_diamonds_1 = __importDefault(require("../strategies/grab_diamonds"));
const getStrategies = () => [spawn_closest_to_diamond_1.default, grab_diamonds_1.default];
exports.default = getStrategies;
//# sourceMappingURL=dummy.js.map