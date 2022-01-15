"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let counter = 0;
const spawnUnits = (units, team, state) => {
    return units
        .filter(x => !x.hasSpawned)
        .map((unit, idx) => {
        const target = state.getSpawnPoints()[idx];
        return {
            type: 'UNIT',
            action: 'SPAWN',
            target: target,
            unitId: `${counter++}`
        };
    });
};
exports.default = spawnUnits;
//# sourceMappingURL=spawn.js.map