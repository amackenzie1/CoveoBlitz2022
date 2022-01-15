import { Strategy } from '../strategy-coordinator'
import { Action, Team, Unit, GameMessage, Diamond, Position } from '../GameInterface'
import { l1Distance, NEIGHBORS, add, allNeighbors, noop, areEqual } from '../utils'
import { a_star, computeDistance, dijkstra } from '../search'


function ticksForSummon(summonLevel: number): number | null {
  if (summonLevel < 5) {
    return summonLevel + 1
  }
  return null
}

function ticksToLevelUp(units: Unit[], diamonds: Diamond[]): [Unit, number][] {
  const ticksMap: Record<string, number | null> = {}
  for (let diamond of diamonds) {
    ticksMap[diamond.id] = ticksForSummon(diamond.summonLevel)
  }
  let unitSummons: [Unit, number][] = []

  for (let unit of units) {
    if (!unit.hasDiamond || !unit.diamondId) { continue }
    const ticks = ticksMap[unit.diamondId!]
    if (!ticks) { continue }
    unitSummons.push([unit, ticks])
  }
  return unitSummons;
}

function minL1DistanceToSpawn(unit: Unit, state: GameMessage) {
  let minDist = Infinity
  const spawnPoints = state.getSpawnPoints()
  for (let spawnPoint of spawnPoints) {
    minDist = Math.min(minDist, l1Distance(unit.position, spawnPoint))
  }
  return minDist
}

function getEnemies(team: Team, state: GameMessage) {
  return state.teams
    .filter(t => t.id !== team.id)
    .flatMap(t => t.units)
    .filter(u => u.hasSpawned)
}

function getMinL1DistanceToEnemy(unit: Unit, enemies: Unit[]) {
  let minDist = Infinity
  for (let enemy of enemies) {
    minDist = Math.min(minDist, l1Distance(unit.position, enemy.position))
  }
  return minL1DistanceToSpawn
}

const moveAwayFromSpawn: Strategy = (units, team, state) => {
  units = units.filter(x => x.hasDiamond)
  const enemyPositions = state.teams
    .filter(t => t.id !== team.id)
    .flatMap(t => t.units)
    .filter(u => u.hasSpawned)
    .map(u => u.position)

  let actions: Action[] = []
  for (let unit of units) {
    const result = dijkstra(enemyPositions,x => areEqual(x, unit.position), { state, max: 5 })
    if (!result) { actions.push(noop(unit)); continue }

    const enemyPos = result.startPosition
    const neighbors = allNeighbors(unit.position)
      .filter(x => state.getTileTypeAt(x) === 'EMPTY')
      .sort((a, b) => computeDistance(a, enemyPos, {state})! - computeDistance(b, enemyPos, {state})!)

    if (neighbors.length) {
      actions.push({
        type: 'UNIT',
        action: 'MOVE',
        target: neighbors[0]!,
        unitId: unit.id
      })
      continue
    }

    const minDist = minL1DistanceToSpawn(unit, state)
    if (minDist >= 4) { continue }
    const betterNeighbors = allNeighbors(unit.position)
      .filter(x => minL1DistanceToSpawn(unit, state) < minDist)
      .sort((x, y) => l1Distance(x, unit.position) - l1Distance(y, unit.position))
    if (betterNeighbors.length) {
      actions.push({
        type: "UNIT",
        action: "MOVE",
        unitId: unit.id,
        target: betterNeighbors[0]!
      })
    }
  }
  return actions
}

export default moveAwayFromSpawn
