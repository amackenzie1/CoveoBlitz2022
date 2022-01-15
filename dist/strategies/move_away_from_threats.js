"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
function minL1DistanceToSpawn(unit, state) {
    let minDist = Infinity;
    const tiles = state.map.tiles;
    for (let x = 0; x < tiles.length; x++) {
        for (let y = 0; y < tiles[x].length; y++) {
            if (tiles[x][y] !== "SPAWN") {
                continue;
            }
            minDist = Math.min(minDist, utils_1.l1Distance(unit.position, { x: x, y: y }));
        }
    }
    return minDist;
}
const moveAwayFromSpawn = (units, team, state) => {
    units = units.filter(x => x.hasDiamond);
    let actions = [];
    for (let unit of units) {
        const minDist = minL1DistanceToSpawn(unit, state);
        if (minDist >= 4) {
            continue;
        }
        const neighbors = utils_1.NEIGHBORS.map(x => utils_1.add(unit.position, x));
        const betterNeighbors = neighbors.filter(x => minL1DistanceToSpawn(unit, state) < minDist).sort((x, y) => utils_1.l1Distance(x, unit.position) - utils_1.l1Distance(y, unit.position));
        if (betterNeighbors.length) {
            actions.push({
                type: "UNIT",
                action: "MOVE",
                unitId: unit.id,
                target: betterNeighbors[0]
            });
        }
    }
    return actions;
};
exports.default = moveAwayFromSpawn;
//# sourceMappingURL=move_away_from_threats.js.map