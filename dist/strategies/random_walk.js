"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const randomMoves = (units, team, state) => {
    return units
        .filter(x => x.hasSpawned && !x.isSummoning)
        .map(unit => {
        return {
            type: 'UNIT',
            action: 'MOVE',
            unitId: unit.id,
            target: utils_1.randomNeighbor(unit.position)
        };
    });
};
exports.default = randomMoves;
//# sourceMappingURL=random_walk.js.map