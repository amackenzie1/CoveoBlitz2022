"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeDistance = exports.a_star = exports.dijkstra = void 0;
const ts_priority_queue_1 = __importDefault(require("ts-priority-queue"));
const utils_1 = require("./utils");
function getNeighbors(pos, tiles) {
    const width = tiles.length;
    const height = tiles[0].length;
    return utils_1.allNeighbors(pos).filter(({ x, y }) => x >= 0 && x < width &&
        y >= 0 && y < height);
}
function inner_dijkstra(starts, tiles, isTarget, options = {}) {
    const { backwards = false, max = Infinity, units = [] } = options;
    const queue = new ts_priority_queue_1.default({ comparator: (a, b) => a.g - b.g });
    starts.forEach(start => queue.queue({ pos: start, g: 0, f: 0 }));
    const visited = new Set();
    while (queue.length) {
        const current = queue.dequeue();
        const currentType = tiles[current.pos.x][current.pos.y];
        if (isTarget(current.pos)) {
            return current;
        }
        if (visited.has(utils_1.stringify(current.pos))) {
            continue;
        }
        if (current.g > max) {
            return null;
        }
        visited.add(utils_1.stringify(current.pos));
        const neighbors = getNeighbors(current.pos, tiles);
        for (let neighbor of neighbors) {
            if (visited.has(utils_1.stringify(neighbor))) {
                continue;
            }
            const neighborType = tiles[neighbor.x][neighbor.y];
            if (neighborType === "WALL") {
                continue;
            }
            if (!backwards && currentType === 'EMPTY' && neighborType === 'SPAWN') {
                continue;
            }
            if (backwards && currentType === 'SPAWN' && neighborType === 'EMPTY') {
                continue;
            }
            if (units.some(unit => utils_1.areEqual(neighbor, unit.position))) {
                continue;
            }
            queue.queue({ pos: neighbor, g: current.g + 1, f: 0, parent: current });
        }
    }
    return null;
}
function dijkstra(starts, tiles, isTarget, options = {}) {
    let destination = inner_dijkstra(starts, tiles, isTarget, options);
    if (!destination) {
        return null;
    }
    const path = [];
    while (destination.parent) {
        path.push(destination.pos);
        destination = destination.parent;
    }
    const startPosition = destination.pos;
    return {
        path: path.reverse(),
        distance: path.length,
        nextTarget: path[0],
        endTarget: path[path.length - 1],
        startPosition
    };
}
exports.dijkstra = dijkstra;
function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
function inner_a_star(start, end, tiles, options = {}) {
    const { backwards = false, max = Infinity, units = [] } = options;
    const queue = new ts_priority_queue_1.default({ comparator: (a, b) => a.f - b.f });
    queue.queue({ pos: start, g: 0, f: Infinity });
    const visited = new Set();
    while (queue.length) {
        const current = queue.dequeue();
        const currentType = tiles[current.pos.x][current.pos.y];
        if (utils_1.areEqual(current.pos, end)) {
            return current;
        }
        if (visited.has(utils_1.stringify(current.pos))) {
            continue;
        }
        if (current.g > max) {
            return null;
        }
        visited.add(utils_1.stringify(current.pos));
        const neighbors = getNeighbors(current.pos, tiles);
        for (let neighbor of neighbors) {
            if (visited.has(utils_1.stringify(neighbor))) {
                continue;
            }
            const neighborType = tiles[neighbor.x][neighbor.y];
            if (neighborType === "WALL") {
                continue;
            }
            if (!backwards && currentType === 'EMPTY' && neighborType === 'SPAWN') {
                continue;
            }
            if (backwards && currentType === 'SPAWN' && neighborType === 'EMPTY') {
                continue;
            }
            if (units.some(unit => utils_1.areEqual(neighbor, unit.position))) {
                continue;
            }
            const g = current.g + 1;
            const f = g + heuristic(neighbor, end);
            queue.queue({ pos: neighbor, g, f, parent: current });
        }
    }
    return null;
}
function a_star(start, end, tiles, options = {}) {
    let destination = inner_a_star(start, end, tiles, options);
    if (!destination) {
        return null;
    }
    const path = [];
    while (destination.parent) {
        path.push(destination.pos);
        destination = destination.parent;
    }
    const startPosition = destination.pos;
    return {
        path: path.reverse(),
        distance: path.length,
        nextTarget: path[0],
        endTarget: path[path.length - 1],
        startPosition: startPosition
    };
}
exports.a_star = a_star;
function computeDistance(a, b, tiles, options = {}) {
    const result = a_star(a, b, tiles, options);
    return result ? result.distance : null;
}
exports.computeDistance = computeDistance;
//# sourceMappingURL=search.js.map