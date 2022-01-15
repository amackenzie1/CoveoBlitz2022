"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const search_1 = require("../search");
const utils_1 = require("../utils");
const spawnUnits = (units, team, state) => {
    const unitsToSpawn = units.filter(x => !x.hasSpawned);
    console.log(`${unitsToSpawn.length} units to spawn`);
    if (!unitsToSpawn.length) {
        return [];
    }
    let diamonds = [...state.map.diamonds];
    const spawnPoints = state.getSpawnPoints();
    const isSpawnPoint = (pos) => !!spawnPoints.find(x => utils_1.areEqual(x, pos));
    const actions = [];
    for (let unit of unitsToSpawn) {
        const result = search_1.dijkstra(diamonds.map(x => x.position), state.map.tiles, isSpawnPoint, { backwards: true });
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
//# sourceMappingURL=spawn_closest_to_diamond.js.map