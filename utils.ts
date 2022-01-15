import { Action, Position, Unit, GameMessage } from './GameInterface'

const add = (a: Position, b: Position): Position => {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  }
}

const areEqual = (a: Position, b: Position): boolean => {
  return a.x === b.x && a.y === b.y
}

function getAllUnits(state: GameMessage) {
  let allUnits: Unit[] = []
  for (let team of state.teams) {
    allUnits = [...allUnits, ...team.units]
  }
  return allUnits
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

const freeNeighbors = (pos: Position, state: GameMessage) => {
  let units = state.teams.flatMap(t => t.units).filter(u => u.hasSpawned).map(x => x.position)
  let diamonds = state.map.diamonds.map(x => x.position)
  let obstacles = [...units, ...diamonds].map(x => stringify(x))

  return allNeighbors(pos)
    .filter(x => state.getTileTypeAt(x) === 'EMPTY')
    .filter(x => !obstacles.includes(stringify(x)))
}

const stringify = (pos: Position): string => `${pos.x},${pos.y}`
const l1Distance = (a: Position, b: Position): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)

const noop = (unit: Unit): Action => {
  return {
    type: 'UNIT',
    action: 'NONE',
    target: unit.position,
    unitId: unit.id,
  }
}

export { add, areEqual, NEIGHBORS, randomNeighbor, allNeighbors, freeNeighbors, stringify, l1Distance, noop, getAllUnits }