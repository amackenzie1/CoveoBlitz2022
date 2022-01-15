"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const search_1 = require("../search");
function getEnemies(team, state) {
    return state.teams
        .filter(t => t.id !== team.id)
        .flatMap(t => t.units)
        .filter(u => u.hasSpawned);
}
function ticksForSummon(summonLevel) {
    if (summonLevel < 5) {
        return summonLevel + 1;
    }
    return null;
}
function getDiamonds(units, diamonds) {
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
const summonStrategy = (units, team, state) => {
    units = units.filter(x => x.hasSpawned && x.hasDiamond);
    const unitsWithTicks = getDiamonds(units, state.map.diamonds);
    const enemyPositions = getEnemies(team, state).map(x => utils_1.stringify(x.position));
    const hasEnemy = (position) => enemyPositions.includes(utils_1.stringify(position));
    let actions = [];
    for (let [unit, ticksRequired] of unitsWithTicks) {
        const returned = search_1.dijkstra([unit.position], state.map.tiles, hasEnemy, false, ticksRequired + 1);
        if (!returned) {
            actions.push({
                type: "UNIT",
                action: "SUMMON",
                unitId: unit.id,
                target: unit.position
            });
            continue;
        }
        if (returned.distance <= ticksRequired) {
            continue;
        }
        actions.push({
            type: "UNIT",
            action: "SUMMON",
            unitId: unit.id,
            target: unit.position
        });
    }
    return actions;
};
exports.default = summonStrategy;
//# sourceMappingURL=simple_summon.js.map