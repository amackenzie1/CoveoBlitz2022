"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spawnUnits = (units, team, state) => {
    return units
        .filter(x => !x.hasSpawned)
        .map((unit, idx) => {
        const target = state.getSpawnPoints()[idx];
        return {
            type: 'UNIT',
            action: 'SPAWN',
            target: target,
            unitId: unit.id
        };
    });
};
exports.default = spawnUnits;
//# sourceMappingURL=dummy_spawn.js.map