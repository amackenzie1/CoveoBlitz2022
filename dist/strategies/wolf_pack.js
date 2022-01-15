"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const search_1 = require("../search");
const utils_1 = require("../utils");
function diamondValue(diamond) {
    return diamond.summonLevel * 20 + diamond.points;
}
function averageDistance(diamond, units, state) {
    let resultToSpawn = search_1.dijkstra([diamond.position], pos => (state.getTileTypeAt(pos) === "SPAWN"), { state: state, backwards: true });
    const distanceToSpawn = resultToSpawn ? resultToSpawn.distance : Infinity;
    let distances = [];
    for (let unit of units) {
        let returned = search_1.a_star(unit.position, diamond.position, { state });
        const returnedDistance = returned ? returned.distance : Infinity;
        distances.push(Math.min(returnedDistance, distanceToSpawn + 1));
    }
    return distances.reduce((a, b) => a + b, 0) / distances.length;
}
function chooseTarget(units, team, state) {
    let potentialTargets = state.map.diamonds
        .filter(x => !x.ownerId || !team.units.find(u => u.id === x.ownerId))
        .sort((x, y) => diamondValue(y) - diamondValue(x))
        .slice(0, 2);
    let targetsWithDistances = [];
    for (let target of potentialTargets) {
        targetsWithDistances.push([target, averageDistance(target, units, state)]);
    }
    targetsWithDistances.sort((a, b) => a[1] - b[1]);
    if (!targetsWithDistances || targetsWithDistances.length === 0) {
        return null;
    }
    return targetsWithDistances[0][0].position;
}
const wolfPack = (units, team, state) => {
    units = units.filter(x => x.hasSpawned && !x.hasDiamond);
    // let diamondValues: [Diamond, number][] = []
    // for (let diamond of state.map.diamonds) {
    //   if (team.units.find(x => x.id === diamond.ownerId)) { continue }
    //   diamondValues.push([diamond, diamondValue(diamond)])
    // }
    // diamondValues.sort((x, y) => y[1] - x[1])
    // if (!diamondValues.length) { return [] }
    const target = chooseTarget(units, team, state);
    if (!target) {
        return [];
    }
    console.log("Target chosen!");
    const enemyPositions = state.teams
        .filter(t => t.id !== team.id)
        .flatMap(t => t.units)
        .filter(u => u.hasSpawned)
        .map(u => u.position);
    const spawnPoints = state.getSpawnPoints();
    const targetToSpawn = search_1.dijkstra(spawnPoints, pos => utils_1.areEqual(pos, target), { state })?.distance || Infinity;
    const targetToEnemy = search_1.dijkstra(enemyPositions, pos => utils_1.areEqual(pos, target), { state })?.distance || Infinity;
    const targetVineRegion = utils_1.getVineRegion(target, state);
    const shouldConsiderVine = Number.isFinite(targetToSpawn) && targetToSpawn + 1 < targetToEnemy;
    let actions = [];
    for (let unit of units) {
        if (shouldConsiderVine) {
            const result = search_1.dijkstra([unit.position], pos => !!targetVineRegion.find(pos2 => utils_1.areEqual(pos, pos2)), { state, backwards: true });
            if (result && result.distance < 10) {
                if (result.distance === 0) {
                    actions.push({
                        type: 'UNIT',
                        action: 'VINE',
                        target: target,
                        unitId: unit.id
                    });
                }
                else {
                    actions.push({
                        type: 'UNIT',
                        action: 'MOVE',
                        target: result.nextTarget,
                        unitId: unit.id
                    });
                }
                continue;
            }
        }
        const result = search_1.a_star(unit.position, target, { state });
        if (!result) {
            continue;
        }
        // Chase the target on-foot
        let targetDiamond = state.map.diamonds.find(d => utils_1.areEqual(d.position, result.endTarget));
        if (targetDiamond?.ownerId) {
            actions.push({
                type: 'UNIT',
                action: result.distance <= 1 ? 'ATTACK' : 'MOVE',
                target: result.nextTarget,
                unitId: unit.id
            });
        }
        else {
            actions.push({
                type: 'UNIT',
                action: 'MOVE',
                target: result.nextTarget,
                unitId: unit.id
            });
        }
    }
    return actions;
};
exports.default = wolfPack;
//# sourceMappingURL=wolf_pack.js.map