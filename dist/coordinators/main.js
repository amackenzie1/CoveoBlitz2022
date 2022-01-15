"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const random_walk_1 = __importDefault(require("../strategies/random_walk"));
const spawn_closest_1 = __importDefault(require("../strategies/spawn_closest"));
const grab_diamonds_1 = __importDefault(require("../strategies/grab_diamonds"));
const hold_complex_1 = __importDefault(require("../strategies/hold_complex"));
const simple_summon_1 = __importDefault(require("../strategies/simple_summon"));
const kill_close_1 = __importDefault(require("../strategies/kill_close"));
const wolf_pack_1 = __importDefault(require("../strategies/wolf_pack"));
const getStrategies = (state) => {
    return [
        [spawn_closest_1.default, 'SPAWN-UNITS'],
        [kill_close_1.default, 'KILL-CLOSE'],
        [grab_diamonds_1.default, 'GRAB-DIAMONDS'],
        state.tick <= 30 && [simple_summon_1.default, 'SUMMON-SIMPLE'],
        [hold_complex_1.default, 'HOLD-COMPLEX'],
        [wolf_pack_1.default, 'WOLF-PACK'],
        [random_walk_1.default, 'RANDOM-WALK'],
    ];
};
exports.default = getStrategies;
//# sourceMappingURL=main.js.map