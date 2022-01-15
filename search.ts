import { STATUS_CODES } from "http";
import PriorityQueue from "ts-priority-queue"
import { GameMessage, Position, TileType, Unit } from "./GameInterface";
import { allNeighbors, areEqual, stringify } from './utils'

type Point = {
    pos: Position
    g: number
    f: number
    parent?: Point
}

type SearchOptions = {
    state: GameMessage
    max?: number
    backwards?: boolean
    ignoreUnitObstacles?: boolean
}

type SearchAlgorithmReturn = {
    // Path contains the end but not the start
    path: Position[]
    distance: number
    nextTarget: Position
    endTarget: Position
    startPosition: Position
}

function getOccupiedTiles(state: GameMessage, ignoreUnitObstacles: boolean): Set<string> {
    const occupiedTiles = new Set<string>()
    if (!ignoreUnitObstacles) {
        state.teams.flatMap(t => t.units).filter(u => u.hasSpawned).forEach(u => occupiedTiles.add(stringify(u.position)))
    }
    state.map.diamonds.map(d => occupiedTiles.add(stringify(d.position)))
    return occupiedTiles
}

function getNeighbors(pos: Position, tiles: TileType[][]) {
    const width = tiles.length
    const height = tiles[0]!.length
    return allNeighbors(pos).filter(({ x, y }) =>
        x >= 0 && x < width &&
        y >= 0 && y < height
    )
}

function inner_dijkstra(starts: Position[], isTarget: (pos: Position) => boolean, options: SearchOptions): Point | null {
    const {
        backwards = false,
        max = Infinity,
        ignoreUnitObstacles = false,
        state
    } = options

    const tiles = state.map.tiles
    const occupiedTiles = getOccupiedTiles(state, ignoreUnitObstacles)
    const queue = new PriorityQueue<Point>({ comparator: (a, b) => a.g - b.g });
    starts.forEach(start => queue.queue({ pos: start, g: 0, f: 0 }))

    const visited = new Set<string>();
    while (queue.length) {
        const current = queue.dequeue();
        const currentType = tiles[current.pos.x]![current.pos.y]
        if (isTarget(current.pos)) {
            return current;
        }
        if (visited.has(stringify(current.pos))) {
            continue;
        }
        if (current.g > max) {
            return null;
        }
        visited.add(stringify(current.pos));
        const neighbors = getNeighbors(current.pos, tiles);
        for (let neighbor of neighbors) {
            if (visited.has(stringify(neighbor))) {
                continue;
            }

            const neighborType = tiles[neighbor.x]![neighbor.y]
            if (neighborType === "WALL") { continue }
            if (!backwards && currentType === 'EMPTY' && neighborType === 'SPAWN') { continue }
            if (backwards && currentType === 'SPAWN' && neighborType === 'EMPTY') { continue }


            const neww: Point = { pos: neighbor, g: current.g + 1, f: 0, parent: current }
            if (isTarget(neighbor)) { return neww }

            if (occupiedTiles.has(stringify(neighbor))) { continue }

            queue.queue(neww);
        }
    }
    return null;
}

function dijkstra(starts: Position[], isTarget: (pos: Position) => boolean, options: SearchOptions): SearchAlgorithmReturn | null {
    let destination = inner_dijkstra(starts, isTarget, options);
    if (!destination) { return null; }

    const path: Position[] = []
    while (destination.parent) {
        path.push(destination.pos);
        destination = destination.parent;
    }

    const startPosition = destination.pos

    return {
        path: path.reverse(),
        distance: path.length,
        nextTarget: path[0]!,
        endTarget: path[path.length - 1]!,
        startPosition
    }
}

function heuristic(a: Position, b: Position) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function inner_a_star(start: Position, end: Position, options: SearchOptions): Point | null {
    const {
        backwards = false,
        max = Infinity,
        ignoreUnitObstacles = false,
        state
    } = options

    const tiles = state.map.tiles
    const occupiedTiles = getOccupiedTiles(state, ignoreUnitObstacles)
    const queue = new PriorityQueue<Point>({ comparator: (a, b) => a.f - b.f });
    queue.queue({ pos: start, g: 0, f: Infinity });
    const visited = new Set<string>();
    while (queue.length) {
        const current = queue.dequeue();
        const currentType = tiles[current.pos.x]![current.pos.y]

        if (areEqual(current.pos, end)) {
            return current;
        }
        if (visited.has(stringify(current.pos))) {
            continue;
        }
        if (current.g > max) {
            return null;
        }
        visited.add(stringify(current.pos));
        const neighbors = getNeighbors(current.pos, tiles);
        for (let neighbor of neighbors) {
            if (visited.has(stringify(neighbor))) {
                continue;
            }

            const neighborType = tiles[neighbor.x]![neighbor.y]
            if (neighborType === "WALL") { continue }
            if (!backwards && currentType === 'EMPTY' && neighborType === 'SPAWN') { continue }
            if (backwards && currentType === 'SPAWN' && neighborType === 'EMPTY') { continue }

            const g = current.g + 1
            const f = g + heuristic(neighbor, end)
            const neww = { pos: neighbor, g, f, parent: current }
            if (areEqual(neighbor, end)) { return neww }

            if (occupiedTiles.has(stringify(neighbor))) { continue }
            queue.queue(neww);
        }
    }
    return null;
}

function a_star(start: Position, end: Position, options: SearchOptions): SearchAlgorithmReturn | null {
    let destination = inner_a_star(start, end, options);
    if (!destination) { return null; }

    const path: Position[] = []
    while (destination.parent) {
        path.push(destination.pos);
        destination = destination.parent;
    }

    const startPosition = destination.pos

    return {
        path: path.reverse(),
        distance: path.length,
        nextTarget: path[0]!,
        endTarget: path[path.length - 1]!,
        startPosition: startPosition
    }
}

function computeDistance(a: Position, b: Position, options: SearchOptions): number | null {
    const result = a_star(a, b, options)
    return result ? result.distance : null
}

export { dijkstra, a_star, computeDistance }
export type { SearchAlgorithmReturn }