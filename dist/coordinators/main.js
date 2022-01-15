"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const random_walk_1 = __importDefault(require("../strategies/random_walk"));
const spawn_closest_to_diamond_1 = __importDefault(require("../strategies/spawn_closest_to_diamond"));
const grab_diamonds_1 = __importDefault(require("../strategies/grab_diamonds"));
const hold_simple_1 = __importDefault(require("../strategies/hold_simple"));
const simple_summon_1 = __importDefault(require("../strategies/simple_summon"));
const wolf_pack_1 = __importDefault(require("../strategies/wolf_pack"));
const getStrategies = () => [
    [spawn_closest_to_diamond_1.default, 'SPAWN-UNITS'],
    [grab_diamonds_1.default, 'GRAB-DIAMONDS'],
    [simple_summon_1.default, 'SUMMON-SIMPLE'],
    [hold_simple_1.default, 'HOLD-SIMPLE'],
    [wolf_pack_1.default, 'WOLF-PACK'],
    [random_walk_1.default, 'RANDOM-WALK'],
];
exports.default = getStrategies;
//# sourceMappingURL=main.js.map