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
};
exports.default = spawnUnits;
//# sourceMappingURL=spawn_strategic.js.map