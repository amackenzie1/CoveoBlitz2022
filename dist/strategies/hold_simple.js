"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const search_1 = require("../search");
const NEIGHBORS_AND_SELF = [...utils_1.NEIGHBORS, { x: 0, y: 0 }];
function isVineable(unitPosition, team, state) {
    let badTeamIds = utils_1.getTeamsWithHigherPriorityNextRound(team.id, state);
    let enemyTeams = badTeamIds.map(id => state.teams.find(t => t.id === id)).filter(t => t);
    let enemyPositions = enemyTeams
        .flatMap(t => t.units)
        .filter(u => !u.hasDiamond && u.hasSpawned)
        .map(u => u.position);
    const enemyPositionSet = new Set(enemyPositions.map(x => utils_1.stringify(x)));
    for (let direction of utils_1.NEIGHBORS) {
        let position = unitPosition;
        do {
            position = utils_1.add(position, direction);
            for (let offset of NEIGHBORS_AND_SELF) {
                let neighbor = utils_1.add(position, offset);
                if (enemyPositionSet.has(utils_1.stringify(neighbor))) {
                    return true;
                }
            }
        } while (state.getTileTypeAt(position) === "EMPTY");
    }
}
const getSafePosition = (unit, team, state, enemyPositions) => {
    const validPositions = utils_1.freeNeighbors(unit.position, state)
        .map(pos => [pos, Math.min(...enemyPositions.map(pos2 => utils_1.l1Distance(pos, pos2)))])
        .sort(([_, a], [__, b]) => b - a)
        .filter(([pos]) => !isVineable(pos, team, state));
    return validPositions[0] || null;
};
const holdSimple = (units, team, state) => {
    units = units.filter(x => x.hasSpawned && x.hasDiamond);
    if (!units.length) {
        return [];
    }
    const enemyUnits = state.teams
        .filter(t => t.id !== team.id)
        .flatMap(t => t.units)
        .filter(u => u.hasSpawned && !u.hasDiamond)
        .map(u => u.position);
    if (state.tick >= state.totalTick - 2) {
        return units.map(unit => {
            const target = getSafePosition(unit, team, state, enemyUnits)?.[0];
            return {
                type: 'UNIT',
                action: target ? 'DROP' : 'NONE',
                target: target || unit.position,
                unitId: unit.id
            };
        });
    }
    const actions = [];
    for (let unit of units) {
        const result = search_1.dijkstra(enemyUnits, x => utils_1.areEqual(x, unit.position), { state: state, max: 7 });
        if (!result) {
            continue;
        }
        const result2 = getSafePosition(unit, team, state, enemyUnits);
        if (result2) {
            const isSafe = result2[1] >= 2;
            actions.push({
                type: 'UNIT',
                action: isSafe ? 'MOVE' : 'DROP',
                target: result2[0],
                unitId: unit.id
            });
            continue;
        }
        // should never happen
        const nonSafeDropZone = utils_1.allNeighbors(unit.position).filter(x => state.getTileTypeAt(x) === 'EMPTY')[0];
        if (nonSafeDropZone) {
            actions.push({
                type: 'UNIT',
                action: 'DROP',
                target: nonSafeDropZone,
                unitId: unit.id
            });
        }
    }
    return actions;
};
exports.default = holdSimple;
//# sourceMappingURL=hold_simple.js.map