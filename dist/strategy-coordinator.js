"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyCoordinator = void 0;
class StrategyCoordinator {
    constructor(getStrategies) {
        this.getStrategies = getStrategies;
    }
    tick(state) {
        const team = state.teams.find(x => x.id === state.teamId);
        if (!team) {
            console.error(`COULDN'T FIND OUR TEAM ${state.teamId}`);
            return [];
        }
        let units = [...team.units];
        const strategies = this.getStrategies(state);
        const allActions = [];
        for (let strategy of strategies) {
            const actions = strategy(units, team, state);
            units = units.filter(x => !actions.find(a => a.unitId === x.id));
            allActions.push(actions);
        }
        return allActions.flat();
    }
}
exports.StrategyCoordinator = StrategyCoordinator;
//# sourceMappingURL=strategy-coordinator.js.map