"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const search_1 = require("../search");
const utils_1 = require("../utils");
const Linfty_prioritization_1 = require("../Linfty_prioritization");
const spawnUnits = (units, team, state) => {
    const unitsToSpawn = units.filter(x => !x.hasSpawned);
    if (!unitsToSpawn.length) {
        return [];
    }
    let diamonds = state.map.diamonds
        .filter(x => !x.ownerId || !team.units.find(u => u.id === x.ownerId));
    let spawnPoints = state.getSpawnPoints();
    const isSpawnPoint = (pos) => !!spawnPoints.find(x => utils_1.areEqual(x, pos));
    const actions = [];
    const target = Linfty_prioritization_1.chooseTarget('unspawned', team, state);
    if (!target) {
        return [];
    }
    for (let unit of unitsToSpawn) {
        const result = search_1.dijkstra(spawnPoints, (x) => (utils_1.areEqual(x, target)), { state });
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
        spawnPoints = spawnPoints.filter((position) => !utils_1.areEqual(position, endTarget));
    }
    return actions;
};
exports.default = spawnUnits;
//# sourceMappingURL=spawn_strategic.js.map