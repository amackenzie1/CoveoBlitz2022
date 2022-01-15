"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUnits = exports.noop = exports.l1Distance = exports.stringify = exports.freeNeighbors = exports.allNeighbors = exports.randomNeighbor = exports.NEIGHBORS = exports.areEqual = exports.add = void 0;
const add = (a, b) => {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
    };
};
exports.add = add;
const areEqual = (a, b) => {
    return a.x === b.x && a.y === b.y;
};
exports.areEqual = areEqual;
function getAllUnits(state) {
    let allUnits = [];
    for (let team of state.teams) {
        allUnits = [...allUnits, ...team.units];
    }
    return allUnits;
}
exports.getAllUnits = getAllUnits;
const NEIGHBORS = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
];
exports.NEIGHBORS = NEIGHBORS;
const randomNeighbor = (pos) => {
    const diff = NEIGHBORS[Math.floor(Math.random() * NEIGHBORS.length)];
    return add(pos, diff);
};
exports.randomNeighbor = randomNeighbor;
const allNeighbors = (pos) => {
    return NEIGHBORS.map(diff => add(pos, diff));
};
exports.allNeighbors = allNeighbors;
const freeNeighbors = (pos, state) => {
    let units = state.teams.flatMap(t => t.units).filter(u => u.hasSpawned).map(x => x.position);
    let diamonds = state.map.diamonds.map(x => x.position);
    let obstacles = [...units, ...diamonds].map(x => stringify(x));
    return allNeighbors(pos)
        .filter(x => state.getTileTypeAt(x) === 'EMPTY')
        .filter(x => !obstacles.includes(stringify(x)));
};
exports.freeNeighbors = freeNeighbors;
const stringify = (pos) => `${pos.x},${pos.y}`;
exports.stringify = stringify;
const l1Distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
exports.l1Distance = l1Distance;
const noop = (unit) => {
    return {
        type: 'UNIT',
        action: 'NONE',
        target: unit.position,
        unitId: unit.id,
    };
};
exports.noop = noop;
//# sourceMappingURL=utils.js.map