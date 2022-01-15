"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.a_star = exports.dijkstra = void 0;
const ts_priority_queue_1 = __importDefault(require("ts-priority-queue"));
const utils_1 = require("./utils");
function getNeighbors(pos, tiles) {
    const width = tiles.length;
    const height = tiles[0].length;
    return utils_1.allNeighbors(pos).filter(({ x, y }) => x >= 0 && x < width &&
        y >= 0 && y < height);
}
const stringify = (pos) => `${pos.x},${pos.y}`;
function inner_dijkstra(start, tiles, isTarget) {
    const queue = new ts_priority_queue_1.default({ comparator: (a, b) => a.g - b.g });
    queue.queue({ pos: start, g: 0, f: 0 });
    const visited = new Set();
    while (queue.length) {
        const current = queue.dequeue();
        const currentType = tiles[current.pos.x][current.pos.y];
        if (isTarget(current.pos)) {
            return current;
        }
        visited.add(stringify(current.pos));
        const neighbors = getNeighbors(current.pos, tiles);
        for (let neighbor of neighbors) {
            if (visited.has(stringify(neighbor))) {
                continue;
            }
            const neighborType = tiles[neighbor.x][neighbor.y];
            if (neighborType === "WALL" || (currentType === 'EMPTY' && neighborType === 'SPAWN')) {
                continue;
            }
            queue.queue({ pos: neighbor, g: current.g + 1, f: 0, parent: current });
        }
    }
    return null;
}
function dijkstra(start, tiles, isTarget) {
    let destination = inner_dijkstra(start, tiles, isTarget);
    if (!destination) {
        return null;
    }
    const path = [];
    while (destination.parent) {
        path.push(destination.pos);
        destination = destination.parent;
    }
    const nextTarget = path[0];
    return {
        path: path.reverse(),
        distance: path.length,
        nextTarget
    };
}
exports.dijkstra = dijkstra;
function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
function inner_a_star(start, end, tiles) {
    const queue = new ts_priority_queue_1.default({ comparator: (a, b) => a.f - b.f });
    queue.queue({ pos: start, g: 0, f: Infinity });
    const visited = new Set();
    while (queue.length) {
        const current = queue.dequeue();
        const currentType = tiles[current.pos.x][current.pos.y];
        if (utils_1.areEqual(start, end)) {
            return current;
        }
        visited.add(stringify(current.pos));
        const neighbors = getNeighbors(current.pos, tiles);
        for (let neighbor of neighbors) {
            if (visited.has(stringify(neighbor))) {
                continue;
            }
            const neighborType = tiles[neighbor.x][neighbor.y];
            if (neighborType === "WALL" || (currentType === 'EMPTY' && neighborType === 'SPAWN')) {
                continue;
            }
            const g = current.g + 1;
            const f = g + heuristic(neighbor, end);
            queue.queue({ pos: neighbor, g, f, parent: current });
        }
    }
    return null;
}
function a_star(start, end, tiles) {
    let destination = inner_a_star(start, end, tiles);
    if (!destination) {
        return null;
    }
    const path = [];
    while (destination.parent) {
        path.push(destination.pos);
        destination = destination.parent;
    }
    const nextTarget = path[0];
    return {
        path: path.reverse(),
        distance: path.length,
        nextTarget
    };
}
exports.a_star = a_star;
//# sourceMappingURL=dijkstra.js.map