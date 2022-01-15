"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spawn_closest_to_diamond_1 = __importDefault(require("../strategies/spawn_closest_to_diamond"));
const grab_diamonds_1 = __importDefault(require("../strategies/grab_diamonds"));
const hold_simple_1 = __importDefault(require("../strategies/hold_simple"));
const simple_summon_1 = __importDefault(require("../strategies/simple_summon"));
const wolf_pack_1 = __importDefault(require("../strategies/wolf_pack"));
const getStrategies = () => [spawn_closest_to_diamond_1.default, grab_diamonds_1.default, simple_summon_1.default, hold_simple_1.default, wolf_pack_1.default];
exports.default = getStrategies;
//# sourceMappingURL=main.js.map