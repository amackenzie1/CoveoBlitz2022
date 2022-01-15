"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noop = exports.l1Distance = exports.stringify = exports.allNeighbors = exports.randomNeighbor = exports.NEIGHBORS = exports.areEqual = exports.add = void 0;
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