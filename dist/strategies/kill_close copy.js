"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    const attackedPositions = [];
    for (let unit of units) {
        const closeTarget = enemyPositions.find(pos => utils_1.l1Distance(pos, unit.position) === 1);
        if (closeTarget && !attackedPositions.some(pos => utils_1.areEqual(pos, closeTarget))) {
            actions.push({
                type: 'UNIT',
                action: 'ATTACK',
                target: closeTarget,
                unitId: unit.id
            });
            attackedPositions.push(closeTarget);
        }
    }
    return actions;
};
exports.default = killClose;
//# sourceMappingURL=kill_close copy.js.map