"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const insights_1 = require("./insights");
class Bot {
    constructor(coordinator, times = [], insights = new insights_1.InsightsProvider()) {
        this.coordinator = coordinator;
        this.times = times;
        this.insights = insights;
        this.initializedInsights = false;
        this.teamPerUnitIds = {};
        this.allUnitsWithDiamonds = [];
    }
    getNextMove(gameMessage) {
        this.collectInsights(gameMessage);
        let currentTime = Date.now();
        const actions = this.coordinator.tick(gameMessage, this.insights);
        this.times.push(Date.now() - currentTime);
        console.log(`Time taken: ${this.times[this.times.length - 1]} ms, maximum time: ${Math.max(...this.times)}ms`);
        return actions;
    }
    getLogs() {
        return this.coordinator.logs;
    }
    collectInsights(gameMessage) {
        const allUnits = gameMessage.teams.flatMap(t => t.units);
        if (!this.initializedInsights) {
            this.teamPerUnitIds = {};
            allUnits.forEach(unit => { this.teamPerUnitIds[unit.id] = unit.teamId; });
            this.initializedInsights = true;
            gameMessage.teams.forEach(t => {
                this.insights.occurrences[t.id] = {
                    killDiamondHolder: 0,
                    vineDiamondHolder: 0,
                    killFreeAgents: 0,
                    vineFreeAgents: 0
                };
            });
        }
        allUnits.forEach(unit => {
            const isDiamondHolder = this.allUnitsWithDiamonds.includes(unit.id);
            const { wasAttackedBy, wasVinedBy } = unit.lastState;
            const attackerTeam = this.teamPerUnitIds[wasAttackedBy || ''];
            const vinerTeam = this.teamPerUnitIds[wasVinedBy || ''];
            if (attackerTeam) {
                this.insights.occurrences[attackerTeam][isDiamondHolder ? 'killDiamondHolder' : 'killFreeAgents']++;
            }
            if (vinerTeam) {
                this.insights.occurrences[vinerTeam][isDiamondHolder ? 'vineDiamondHolder' : 'vineFreeAgents']++;
            }
        });
        this.allUnitsWithDiamonds = allUnits.filter(u => u.hasSpawned && u.hasDiamond).map(u => u.id);
    }
}
exports.Bot = Bot;
//# sourceMappingURL=Bot.js.map