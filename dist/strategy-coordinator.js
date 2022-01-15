"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyCoordinator = void 0;
const utils_1 = require("./utils");
class StrategyCoordinator {
    constructor(getStrategies) {
        this.getStrategies = getStrategies;
        this.logs = [];
    }
    tick(state, insights) {
        const team = state.teams.find(x => x.id === state.teamId);
        if (!team) {
            console.error(`\n\n\n\nCOULDN'T FIND OUR TEAM ${state.teamId}\n\n\n\n`);
            return [];
        }
        let units = [...team.units];
        const strategies = this.getStrategies(state);
        const logs = [];
        const allActions = [];
        for (let obj of strategies) {
            if (!obj) {
                continue;
            }
            const [strategy, name] = obj;
            //console.log(`Current strategy: ${name}`)
            const actions = strategy(units, team, state, insights);
            const isOk = validateNoCoveoPathfinding(actions, units);
            if (!isOk) {
                logs.push(`Strategy ${name} tried to use COVEO pathfinding`);
                return [];
            }
            const claimedUnits = units.filter(x => actions.find(a => a.unitId === x.id));
            logs.push(`Strategy ${name} claimed: [${claimedUnits.map(x => `${x.id} (${x.position ? utils_1.stringify(x.position) : 'unspawned'})`).join('; ')}]`);
            units = units.filter(x => !actions.find(a => a.unitId === x.id));
            allActions.push(actions);
        }
        logs.push(`Unclaimed units: ${units.map(x => `${x.id} (${x.position ? utils_1.stringify(x.position) : 'unspawned'})`).join('; ')}}`);
        this.logs.push(logs);
        return allActions.flat();
    }
}
exports.StrategyCoordinator = StrategyCoordinator;
const validateNoCoveoPathfinding = (actions, units) => {
    for (let action of actions) {
        if (action.action !== 'MOVE') {
            continue;
        }
        const { target, unitId } = action;
        const unitPosition = units.find(u => u.hasSpawned && u.id === unitId)?.position;
        if (!unitPosition) {
            continue;
        }
        if (utils_1.l1Distance(unitPosition, target) > 1) {
            console.error(`\n\n\n\n\n\nNOOOOOOOOOOOOOOOOOOOOOO\n${JSON.stringify(action)}\n\n\n\n\n\n\n\n`);
            return false;
        }
    }
    return true;
};
//# sourceMappingURL=strategy-coordinator.js.map