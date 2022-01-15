"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const search_1 = require("../search");
const utils_1 = require("../utils");
const spawnUnits = (units, team, state) => {
    const unitsToSpawn = units.filter(x => !x.hasSpawned);
    if (!unitsToSpawn.length) {
        return [];
    }
    let diamonds = state.map.diamonds
        .filter(x => !x.ownerId || !team.units.find(u => u.id === x.ownerId));
    const spawnPoints = state.getSpawnPoints();
    const isSpawnPoint = (pos) => !!spawnPoints.find(x => utils_1.areEqual(x, pos));
    console.log(state.tick, state.teamPlayOrderings, team.id);
    if (state.tick !== 0 || state.teamPlayOrderings[0]?.[0] === team.id) {
        console.log("SPAWNING PRIMARY");
        const actions = [];
        for (let unit of unitsToSpawn) {
            const result = search_1.dijkstra(diamonds.map(x => x.position), isSpawnPoint, { state: state, backwards: true });
            if (!result) {
                continue;
            }
            const { startPosition, endTarget } = result;
            actions.push({
                type: 'UNIT',
                action: 'SPAWN',
                unitId: unit.id,
                target: endTarget
            });
            diamonds = diamonds.filter(({ position }) => !utils_1.areEqual(position, startPosition));
        }
        return actions;
    }
    // Initial tick: choose 2nd best positions to spawn
    console.log('Initial attack but NON-PRIMARY');
    const reservedPositions = [];
    let diamondsToClaim = [...diamonds];
    let maxDistance = 0;
    for (let unit of unitsToSpawn) {
        const result = search_1.dijkstra(diamondsToClaim.map(x => x.position), isSpawnPoint, { state: state, backwards: true });
        if (result) {
            maxDistance = Math.max(maxDistance, result.distance);
            reservedPositions.push(result.endTarget);
            diamondsToClaim = diamondsToClaim.filter(({ position }) => !utils_1.areEqual(position, result.startPosition));
        }
    }
    let bannedPositions = [];
    let result;
    do {
        result = search_1.dijkstra(diamonds.map(x => x.position), (position) => (isSpawnPoint(position) && !bannedPositions.includes(utils_1.stringify(position))), { state: state, max: maxDistance, backwards: true });
        if (!result || result.distance > maxDistance) {
            break;
        }
        bannedPositions.push(utils_1.stringify(result.endTarget));
    } while (result);
    const actions = [];
    for (let unit of unitsToSpawn) {
        const result = search_1.dijkstra(diamonds.map(x => x.position), (position) => (isSpawnPoint(position) && !bannedPositions.includes(utils_1.stringify(position))), { state: state, backwards: true });
        if (!result) {
            continue;
        }
        const { startPosition, endTarget } = result;
        actions.push({
            type: 'UNIT',
            action: 'SPAWN',
            unitId: unit.id,
            target: endTarget
        });
        diamonds = diamonds.filter(({ position }) => !utils_1.areEqual(position, startPosition));
    }
    return actions;
};
exports.default = spawnUnits;
//# sourceMappingURL=spawn_closest copy.js.map