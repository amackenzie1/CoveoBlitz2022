"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const strategy_coordinator_1 = require("./strategy-coordinator");
const dummy_1 = __importDefault(require("./coordinators/dummy"));
class Bot {
    constructor() {
        this.coordinator = new strategy_coordinator_1.StrategyCoordinator(dummy_1.default);
    }
    getNextMove(gameMessage) {
        const actions = this.coordinator.tick(gameMessage);
        console.log("ACTIONS", JSON.stringify(actions));
        return actions;
    }
}
exports.Bot = Bot;
//# sourceMappingURL=Bot.js.map