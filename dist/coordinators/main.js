"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spawn_closest_to_diamond_1 = __importDefault(require("../strategies/spawn_closest_to_diamond"));
const grab_diamonds_1 = __importDefault(require("../strategies/grab_diamonds"));
const hold_dumb_1 = __importDefault(require("../strategies/hold_dumb"));
const simple_summon_1 = __importDefault(require("../strategies/simple_summon"));
const move_away_from_spawn_1 = __importDefault(require("../strategies/move_away_from_spawn"));
const getStrategies = () => [spawn_closest_to_diamond_1.default, grab_diamonds_1.default, move_away_from_spawn_1.default, simple_summon_1.default, hold_dumb_1.default];
exports.default = getStrategies;
//# sourceMappingURL=main.js.map