import { Action, Position, Team, Unit, GameMessage } from './GameInterface'

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

const hasClearLOS = (a: Position, b: Position, state: GameMessage): boolean => {
  if (a.x !== b.x && a.y !== b.y) { return false }

  const diff: Position = {
    x: Math.sign(b.x - a.x),
    y: Math.sign(b.y - a.y),
  }

  let pos = a
  while (true) {
    const type = state.getTileTypeAt(pos)
    if (!type) { return false } // shouldn't happen
    if (type !== 'EMPTY') { return false }

    if (areEqual(pos, b)) { return true }
    pos = add(pos, diff)
  }

  return false // shouldn't happen
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

function getTeamsWithHigherPriorityNextRound(myTeamId: string, state: GameMessage) {
  let teamPlayOrder = state.teamPlayOrderings[state.tick + 1]
  if (!teamPlayOrder) { return [] }

  let higherPriority = []
  for (let teamId of teamPlayOrder) {
    if (teamId === myTeamId) { break }
    higherPriority.push(teamId)
  }
  return higherPriority
}

function getTeamsWithLowerPriorityThisRound(myTeamId: string, state: GameMessage) {
  let teamPlayOrder = state.teamPlayOrderings[state.tick]
  if (!teamPlayOrder) { return [] }

  teamPlayOrder.reverse()
  let lowerPriority = []
  for (let teamId of teamPlayOrder) {
    if (teamId === myTeamId) { break }
    lowerPriority.push(teamId)
  }
  return lowerPriority
}

function getVineRegion(center: Position, state: GameMessage): Position[] {
  const region: Position[] = []
  for (let dir of NEIGHBORS) {
    let position = add(center, dir)
    while (state.getTileTypeAt(position) === 'EMPTY') {
      region.push(position)
      position = add(position, dir)
    }
  }
  return region
}


const NEIGHBORS_AND_SELF = [...NEIGHBORS, { x: 0, y: 0 }]

function isVineable(unitPosition: Position, team: Team, state: GameMessage) {
  let badTeamIds = getTeamsWithHigherPriorityNextRound(team.id, state)
  let enemyTeams = badTeamIds.map(id => state.teams.find(t => t.id === id)).filter(t => t)
  let enemyPositions = enemyTeams
    .flatMap(t => t!.units)
    .filter(u => !u.hasDiamond && u.hasSpawned)
    .map(u => u.position)

  const enemyPositionSet = new Set(enemyPositions.map(x => stringify(x)))

  for (let direction of NEIGHBORS) {
    let position = unitPosition
    do {
      position = add(position, direction)
      for (let offset of NEIGHBORS_AND_SELF) {
        let neighbor = add(position, offset)
        if (enemyPositionSet.has(stringify(neighbor))) {
          return true
        }
      }
    }
    while (state.getTileTypeAt(position) === "EMPTY")
  }
}

export {
  hasClearLOS,
  add,
  areEqual,
  NEIGHBORS,
  randomNeighbor,
  allNeighbors,
  freeNeighbors,
  stringify,
  l1Distance,
  noop,
  getAllUnits,
  getTeamsWithHigherPriorityNextRound,
  getTeamsWithLowerPriorityThisRound,
  getVineRegion,
  isVineable
}