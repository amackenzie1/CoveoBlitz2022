import PriorityQueue from "ts-priority-queue"
import { Position, TileType } from "./GameInterface";
import { allNeighbors, areEqual, stringify } from './utils'

type Point = {
    pos: Position
    g: number
    f: number
    parent?: Point
}

function getNeighbors(pos: Position, tiles: TileType[][]) {
    const width = tiles.length
    const height = tiles[0]!.length
    return allNeighbors(pos).filter(({ x, y }) =>
        x >= 0 && x < width &&
        y >= 0 && y < height
    )
}

function inner_dijkstra(start: Position, tiles: TileType[][], isTarget: (pos: Position) => boolean): Point | null {
    const queue = new PriorityQueue<Point>({ comparator: (a, b) => a.g - b.g });
    queue.queue({ pos: start, g: 0, f: 0 });
    const visited = new Set<string>();
    while (queue.length) {
        const current = queue.dequeue();
        const currentType = tiles[current.pos.x]![current.pos.y]
        if (isTarget(current.pos)) {
            return current;
        }
        visited.add(stringify(current.pos));
        const neighbors = getNeighbors(current.pos, tiles);
        for (let neighbor of neighbors) {
            if (visited.has(stringify(neighbor))) {
                continue;
            }

            const neighborType = tiles[neighbor.x]![neighbor.y]
            if (neighborType === "WALL" || (currentType === 'EMPTY' && neighborType === 'SPAWN')) {
                continue;
            }

            queue.queue({ pos: neighbor, g: current.g + 1, f: 0, parent: current });
        }
    }
    return null;
}

// Path contains the end but not the start
type SearchAlgorithmReturn = {
    path: Position[]
    distance: number
    nextTarget: Position
}

function dijkstra(start: Position, tiles: TileType[][], isTarget: (pos: Position) => boolean): SearchAlgorithmReturn | null {
    let destination = inner_dijkstra(start, tiles, isTarget);
    if (!destination) { return null; }

    const path: Position[] = []
    while (destination.parent) {
        path.push(destination.pos);
        destination = destination.parent;
    }

    const nextTarget = path[0]!

    return {
        path: path.reverse(),
        distance: path.length,
        nextTarget
    }
}

function heuristic(a: Position, b: Position) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}


function inner_a_star(start: Position, end: Position, tiles: TileType[][]): Point | null {
    const queue = new PriorityQueue<Point>({ comparator: (a, b) => a.f - b.f });
    queue.queue({ pos: start, g: 0, f: Infinity });
    const visited = new Set<string>();
    while (queue.length) {
        const current = queue.dequeue();
        const currentType = tiles[current.pos.x]![current.pos.y]
        if (areEqual(start, end)) {
            return current;
        }
        visited.add(stringify(current.pos));
        const neighbors = getNeighbors(current.pos, tiles);
        for (let neighbor of neighbors) {
            if (visited.has(stringify(neighbor))) {
                continue;
            }

            const neighborType = tiles[neighbor.x]![neighbor.y]
            if (neighborType === "WALL" || (currentType === 'EMPTY' && neighborType === 'SPAWN')) {
                continue;
            }
            const g = current.g + 1
            const f = g + heuristic(neighbor, end)

            queue.queue({ pos: neighbor, g, f, parent: current });
        }
    }
    return null;
}

function a_star(start: Position, end: Position, tiles: TileType[][],): SearchAlgorithmReturn | null {
    let destination = inner_a_star(start, end, tiles);
    if (!destination) { return null; }

    const path: Position[] = []
    while (destination.parent) {
        path.push(destination.pos);
        destination = destination.parent;
    }

    const nextTarget = path[0]!

    return {
        path: path.reverse(),
        distance: path.length,
        nextTarget
    }
}


export { dijkstra, a_star }