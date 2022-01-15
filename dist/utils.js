"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allNeighbors = exports.randomNeighbor = exports.NEIGHBORS = exports.areEqual = exports.add = void 0;
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
    { x: -1, y: 0 },
    { x: 0, y: 1 },
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
//# sourceMappingURL=utils.js.map