"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const search_1 = require("../search");
const utils_1 = require("../utils");
const spawnFarthest = (units, team, state) => {
    const unitToSpawn = units.filter(x => !x.hasSpawned)[0];
    if (!unitToSpawn) {
        return [];
    }
    let diamonds = state.map.diamonds.filter(x => !x.ownerId);
    const allEnemies = state.teams
        .filter(t => t.id !== team.id)
        .flatMap(t => t.units)
        .filter(u => u.hasSpawned)
        .map(u => u.position);
    const spawnPoints = state.getSpawnPoints();
    const isSpawnPoint = (pos) => !!spawnPoints.find(x => utils_1.areEqual(x, pos));
    const result = diamonds
        .map(diamond => {
        const distToEnemies = search_1.computeDistance(allEnemies, diamond.position, { state });
        const distToSpawn = search_1.computeDistance(spawnPoints, diamond.position, { state });
        if (!distToSpawn || distToSpawn > 8) {
            return null;
        }
        if (distToEnemies && distToEnemies < 4) {
            return null;
        }
        return diamond.position;
    })
        .filter(x => x)[0];
    if (!result) {
        return [];
    }
    const baba = search_1.dijkstra([result], isSpawnPoint, { state, backwards: true });
    if (!baba) {
        return [];
    }
    return [{
            type: 'UNIT',
            action: 'SPAWN',
            target: baba.endTarget,
            unitId: unitToSpawn.id
        }];
};
exports.default = spawnFarthest;
//# sourceMappingURL=spawn_farthest.js.map