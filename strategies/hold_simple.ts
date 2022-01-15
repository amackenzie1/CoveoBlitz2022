import { Strategy } from '../strategy-coordinator'
import { Action, GameMessage, TileType, Diamond, Position, Unit, Team } from '../GameInterface'
import { randomNeighbor, areEqual, stringify, l1Distance, allNeighbors, noop, freeNeighbors, hasClearLOS, getTeamsWithHigherPriorityNextRound, NEIGHBORS, add, isVineable } from '../utils'
import { computeDistance, dijkstra } from "../search"


const getSafePosition = (unit: Unit, team: Team, state: GameMessage, enemyPositions: Position[]): [Position, number] | null => {
  const validPositions = freeNeighbors(unit.position, state)
    .map<[Position, number]>(pos => [pos, Math.min(...enemyPositions.map(pos2 => l1Distance(pos, pos2)))])
    .sort(([_, a], [__, b]) => b - a)
    .filter(([pos]) => !isVineable(pos, team, state))

  return validPositions[0] || null
}

const holdSimple: Strategy = (units, team, state) => {
  units = units.filter(x => x.hasSpawned && x.hasDiamond)
  if (!units.length) { return [] }

  const enemyUnits = state.teams
    .filter(t => t.id !== team.id)
    .flatMap(t => t.units)
    .filter(u => u.hasSpawned && !u.hasDiamond)
    .map(u => u.position)

  if (state.tick >= state.totalTick - 2) {
    return units.map<Action>(unit => {
      const target = getSafePosition(unit, team, state, enemyUnits)?.[0]
      return {
        type: 'UNIT',
        action: target ? 'DROP' : 'NONE',
        target: target || unit.position,
        unitId: unit.id
      }
    })
  }

  const actions: Action[] = []
  for (let unit of units) {
    const result = dijkstra(enemyUnits, x => areEqual(x, unit.position), { state: state, max: 7 })
    if (!result) { continue }

    const result2 = getSafePosition(unit, team, state, enemyUnits)
    if (result2) {
      const isSafe = result2[1] >= 2
      actions.push({
        type: 'UNIT',
        action: isSafe ? 'MOVE' : 'DROP',
        target: result2[0],
        unitId: unit.id
      })
      continue
    }

    // should never happen
    const nonSafeDropZone = allNeighbors(unit.position).filter(x => state.getTileTypeAt(x) === 'EMPTY')[0]
    if (nonSafeDropZone) {
      actions.push({
        type: 'UNIT',
        action: 'DROP',
        target: nonSafeDropZone,
        unitId: unit.id
      })
    }


  }

  return actions
}

export default holdSimple