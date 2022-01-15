import PriorityQueue from "ts-priority-queue"
import { Position, TileType } from "./GameInterface";
import { allNeighbors, areEqual, stringify } from './utils'

type Point = {
    pos: Position
    g: number
    f: number
    parent?: Point
}

type SearchAlgorithmReturn = {
    // Path contains the end but not the start
    path: Position[]
    distance: number
    nextTarget: Position
    endTarget: Position
    startPosition: Position
}

function getNeighbors(pos: Position, tiles: TileType[][]) {
    const width = tiles.length
    const height = tiles[0]!.length
    return allNeighbors(pos).filter(({ x, y }) =>
        x >= 0 && x < width &&
        y >= 0 && y < height
    )
}

function inner_dijkstra(starts: Position[], tiles: TileType[][], isTarget: (pos: Position) => boolean, backwards: boolean = false, max: number = Infinity): Point | null {
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
        if (current.g > max){
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


            queue.queue({ pos: neighbor, g: current.g + 1, f: 0, parent: current });
        }
    }
    return null;
}

function dijkstra(starts: Position[], tiles: TileType[][], isTarget: (pos: Position) => boolean, backwards: boolean = false, max: number = Infinity): SearchAlgorithmReturn | null {
    let destination = inner_dijkstra(starts, tiles, isTarget, backwards, max);
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

function inner_a_star(start: Position, end: Position, tiles: TileType[][], max: number = Infinity): Point | null {
    const queue = new PriorityQueue<Point>({ comparator: (a, b) => a.f - b.f });
    queue.queue({ pos: start, g: 0, f: Infinity });
    const visited = new Set<string>();
    if (max === 69) {
        //console.log(`-------------[ Start ${stringify(start)}, End: ${stringify(end)}, Queue Length: ${queue.length} ]-----------`)
    }
    while (queue.length) {
        const current = queue.dequeue();
        const currentType = tiles[current.pos.x]![current.pos.y]
        if (max === 69) {
            //console.log(`Current: ${stringify(current.pos)}, ${areEqual(start, end)}, ${visited.has(stringify(current.pos))}, ${current.g > max}`)
        }
        if (areEqual(current.pos, end)) {
            return current;
        }
        if (visited.has(stringify(current.pos))) {
            continue;
        }
        if (current.g > max){
            return null;
        }
        visited.add(stringify(current.pos));
        const neighbors = getNeighbors(current.pos, tiles);
        if (max === 69) {
            //console.log(`Expanding ${stringify(current.pos)}`)
        }
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

function a_star(start: Position, end: Position, tiles: TileType[][], max: number = Infinity): SearchAlgorithmReturn | null {
    let destination = inner_a_star(start, end, tiles, max);
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


export { dijkstra, a_star }