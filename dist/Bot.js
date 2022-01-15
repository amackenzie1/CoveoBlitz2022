"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
class Bot {
    constructor(coordinator, times = []) {
        this.coordinator = coordinator;
        this.times = times;
    }
    getNextMove(gameMessage) {
        let currentTime = Date.now();
        const actions = this.coordinator.tick(gameMessage);
        this.times.push(Date.now() - currentTime);
        console.log(`Time taken: ${this.times[this.times.length - 1]} ms, maximum time: ${Math.max(...this.times)}`);
        console.log("ACTIONS", JSON.stringify(actions));
        return actions;
    }
}
exports.Bot = Bot;
//# sourceMappingURL=Bot.js.map