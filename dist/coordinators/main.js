"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const random_walk_1 = __importDefault(require("../strategies/random_walk"));
const spawn_closest_1 = __importDefault(require("../strategies/spawn_closest"));
const spawn_strategic_1 = __importDefault(require("../strategies/spawn_strategic"));
const grab_diamonds_1 = __importDefault(require("../strategies/grab_diamonds"));
const grab_close_1 = __importDefault(require("../strategies/grab_close"));
const hold_complex_1 = __importDefault(require("../strategies/hold_complex"));
const simple_summon_1 = __importDefault(require("../strategies/simple_summon"));
const kill_close_1 = __importDefault(require("../strategies/kill_close"));
const bear_pack_1 = __importDefault(require("../strategies/bear_pack"));
const kill_whatever_you_can_1 = __importDefault(require("../strategies/kill_whatever_you_can"));
const kill_own_units_1 = __importDefault(require("../strategies/kill_own_units"));
const getStrategies = (state) => {
    return [
        state.tick > 5 && [spawn_strategic_1.default, 'SPAWN-STRATEGIC'],
        [spawn_closest_1.default, 'SPAWN-CLOSEST'],
        [kill_close_1.default, 'KILL-CLOSE'],
        state.tick <= 30 && [grab_diamonds_1.default, 'GRAB-DIAMONDS'],
        [simple_summon_1.default, 'SUMMON-SIMPLE'],
        [hold_complex_1.default, 'HOLD-COMPLEX'],
        [grab_close_1.default, 'GRAB-DIAMOND-CLOSE'],
        [bear_pack_1.default, 'BEAR-PACK'],
        [kill_own_units_1.default, 'KILL-OWN'],
        [kill_whatever_you_can_1.default, "KILL-ANYTHING"],
        [random_walk_1.default, 'RANDOM-WALK'],
    ];
};
exports.default = getStrategies;
//# sourceMappingURL=main.js.map