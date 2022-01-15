import { Strategy } from '../strategy-coordinator'
import { Action, GameMessage, TileType, Diamond, Position, Unit } from '../GameInterface'
import { randomNeighbor, areEqual, stringify, l1Distance, allNeighbors, noop, freeNeighbors } from '../utils'
import { computeDistance, dijkstra } from "../search"

const getDropPosition = (unit: Unit, state: GameMessage, enemyPositions: Position[]): Position | null => {
  const validPositions = allNeighbors(unit.position)
    .filter(pos => state.getTileTypeAt(pos) === 'EMPTY')

  let desired = 3
  let preferedPosition
  do {
    preferedPosition = validPositions
      .filter(pos => !enemyPositions.find(pos2 => l1Distance(pos, pos2) >= desired))[0]
    desired--
  } while (preferedPosition === undefined && desired > 0)

  const target = preferedPosition || validPositions[0]
  return target || null
}

const holdSimple: Strategy = (units, team, state) => {
  units = units.filter(x => x.hasSpawned && x.hasDiamond)
  if (!units.length) { return [] }

  const enemyUnits = state.teams
    .filter(t => t.id !== team.id)
    .flatMap(t => t.units)
    .filter(u => u.hasSpawned && !u.hasDiamond)
    .map(u => u.position)

  if (state.tick >= state.totalTick - 4) {
    return units.map<Action>(unit => {
      const target = getDropPosition(unit, state, enemyUnits)
      return {
        type: 'UNIT',
        action: target ? 'DROP' : 'NONE',
        target: target || unit.position,
        unitId: unit.id
      }
    })
  }

  return units.map<Action>(unit => {
    const result = dijkstra(enemyUnits, x => areEqual(x, unit.position), { state: state, max: 7 })
    if (!result) {
      console.log(`Nooping ${unit.id} (${stringify(unit.position)})`)
      return noop(unit)
    }

    const enemyPos = result.startPosition
    const neighbors = freeNeighbors(unit.position, state)

      // sort backwards
      .sort((a, b) => computeDistance(b, enemyPos, { state })! - computeDistance(a, enemyPos, { state })!)

    console.log(`Need to run ${stringify(unit.position)} from ${stringify(enemyPos)}: [${neighbors.join(', ')}]`)
    if (neighbors.length) {
      return {
        type: 'UNIT',
        action: 'MOVE',
        target: neighbors[0]!,
        unitId: unit.id
      }
    }

    if (!enemyUnits.some(enemy => l1Distance(enemy, unit.position) <= 2)) {
      return {
        type: 'UNIT',
        action: 'MOVE',
        target: randomNeighbor(unit.position),
        unitId: unit.id
      }
    }

    const escapeMove = freeNeighbors(unit.position, state)[0]
    if (escapeMove) {
      return {
        type: 'UNIT',
        action: 'MOVE',
        target: escapeMove,
        unitId: unit.id
      }
    }

    return {
      type: 'UNIT',
      action: 'DROP',
      target: unit.position,
      unitId: unit.id
    }
  })
}

export default holdSimple