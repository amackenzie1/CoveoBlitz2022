"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const search_1 = require("../search");
function ticksForSummon(summonLevel) {
    if (summonLevel < 5) {
        return summonLevel + 1;
    }
    return null;
}
function ticksToLevelUp(units, diamonds) {
    const ticksMap = {};
    for (let diamond of diamonds) {
        ticksMap[diamond.id] = ticksForSummon(diamond.summonLevel);
    }
    let unitSummons = [];
    for (let unit of units) {
        if (!unit.hasDiamond || !unit.diamondId) {
            continue;
        }
        const ticks = ticksMap[unit.diamondId];
        if (!ticks) {
            continue;
        }
        unitSummons.push([unit, ticks]);
    }
    return unitSummons;
}
function minL1DistanceToSpawn(unit, state) {
    let minDist = Infinity;
    const spawnPoints = state.getSpawnPoints();
    for (let spawnPoint of spawnPoints) {
        minDist = Math.min(minDist, utils_1.l1Distance(unit.position, spawnPoint));
    }
    return minDist;
}
function getEnemies(team, state) {
    return state.teams
        .filter(t => t.id !== team.id)
        .flatMap(t => t.units)
        .filter(u => u.hasSpawned);
}
function getMinL1DistanceToEnemy(unit, enemies) {
    let minDist = Infinity;
    for (let enemy of enemies) {
        minDist = Math.min(minDist, utils_1.l1Distance(unit.position, enemy.position));
    }
    return minL1DistanceToSpawn;
}
const moveAwayFromSpawn = (units, team, state) => {
    units = units.filter(x => x.hasDiamond);
    const enemyPositions = state.teams
        .filter(t => t.id !== team.id)
        .flatMap(t => t.units)
        .filter(u => u.hasSpawned)
        .map(u => u.position);
    let actions = [];
    for (let unit of units) {
        const result = search_1.dijkstra(enemyPositions, x => utils_1.areEqual(x, unit.position), { state, max: 5 });
        if (!result) {
            actions.push(utils_1.noop(unit));
            continue;
        }
        const enemyPos = result.startPosition;
        const neighbors = utils_1.allNeighbors(unit.position)
            .filter(x => state.getTileTypeAt(x) === 'EMPTY')
            .sort((a, b) => search_1.computeDistance(a, enemyPos, { state }) - search_1.computeDistance(b, enemyPos, { state }));
        if (neighbors.length) {
            actions.push({
                type: 'UNIT',
                action: 'MOVE',
                target: neighbors[0],
                unitId: unit.id
            });
            continue;
        }
        const minDist = minL1DistanceToSpawn(unit, state);
        if (minDist >= 4) {
            continue;
        }
        const betterNeighbors = utils_1.allNeighbors(unit.position)
            .filter(x => minL1DistanceToSpawn(unit, state) < minDist)
            .sort((x, y) => utils_1.l1Distance(x, unit.position) - utils_1.l1Distance(y, unit.position));
        if (betterNeighbors.length) {
            actions.push({
                type: "UNIT",
                action: "MOVE",
                unitId: unit.id,
                target: betterNeighbors[0]
            });
        }
    }
    return actions;
};
exports.default = moveAwayFromSpawn;
//# sourceMappingURL=_DEPRECATED_move_away_from_threats.js.map