import { Position } from './GameInterface'

const add = (a: Position, b: Position): Position => {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  }
}

const areEqual = (a: Position, b: Position): boolean => {
  return a.x === b.x && a.y === b.y
}

const NEIGHBORS: Position[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
]

const randomNeighbor = (pos: Position): Position => {
  const diff = NEIGHBORS[Math.floor(Math.random() * NEIGHBORS.length)]!
  return add(pos, diff)
}

const allNeighbors = (pos: Position): Position[] => {
  return NEIGHBORS.map(diff => add(pos, diff))
}

const stringify = (pos: Position): string => `${pos.x},${pos.y}`
const l1Distance = (a: Position, b: Position): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)

export { add, areEqual, NEIGHBORS, randomNeighbor, allNeighbors, stringify, l1Distance }