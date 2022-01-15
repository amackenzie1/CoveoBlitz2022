"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const search_1 = require("../search");
const utils_1 = require("../utils");
const killSummoning = (units, team, state) => {
    units = units.filter(x => x.hasSpawned && !x.hasDiamond);
    const enemyPositions = state.teams
        .filter(t => t.id !== team.id)
        .flatMap(t => t.units)
        .filter(u => u.hasSpawned && u.hasDiamond && u.isSummoning)
        .map(u => u.position);
    const actions = [];
    for (let unit of units) {
        const result = search_1.dijkstra([unit.position], pos => !!enemyPositions.find(pos2 => utils_1.areEqual(pos, pos2)), { state, max: 3 });
        if (!result) {
            continue;
        }
        const { nextTarget, distance } = result;
        actions.push({
            type: 'UNIT',
            action: distance <= 1 ? 'ATTACK' : 'MOVE',
            target: nextTarget,
            unitId: unit.id
        });
    }
    return actions;
};
exports.default = killSummoning;
//# sourceMappingURL=kill_summoning.js.map