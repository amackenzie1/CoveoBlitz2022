"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const search_1 = require("../search");
const utils_1 = require("../utils");
const killClose = (units, team, state) => {
    units = units.filter(x => x.hasSpawned && !x.hasDiamond);
    const weakTeams = utils_1.getTeamsWithLowerPriorityThisRound(team.id, state);
    const enemyPositions = state.teams
        .filter(t => weakTeams.includes(t.id))
        .flatMap(t => t.units)
        .filter(u => u.hasSpawned && u.hasDiamond)
        .map(u => u.position);
    const actions = [];
    for (let unit of units) {
        const result = search_1.dijkstra([unit.position], pos => !!enemyPositions.find(pos2 => utils_1.areEqual(pos, pos2)), { state, max: 3, isAttack: true });
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
exports.default = killClose;
//# sourceMappingURL=kill_close.js.map