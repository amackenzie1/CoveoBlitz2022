import { Strategy } from '../strategy-coordinator'
import { Action, GameMessage, TileType, Diamond, Position, Unit } from '../GameInterface'
import { randomNeighbor, areEqual, stringify, l1Distance, allNeighbors } from '../utils'
import { dijkstra } from "../search"

const getDropPosition = (unit: Unit, state: GameMessage, enemyPositions: Position[]): Position | null => {
  const validPositions = allNeighbors(unit.position)
    .filter(pos => state.getTileTypeAt(pos) === 'EMPTY')
  const preferedPosition = validPositions
    .filter(pos => !enemyPositions.find(pos2 => l1Distance(pos, pos2) >= 3))[0]

  const target = preferedPosition || validPositions[0]
  return target || null
}

const holdDumb: Strategy = (units, team, state) => {
  units = units.filter(x => x.hasSpawned && x.hasDiamond)
  if (!units.length) { return [] }

  const enemyUnits = state.teams
    .filter(t => t.id !== team.id)
    .flatMap(t => t.units)
    .filter(u => u.hasSpawned && !u.hasDiamond)
    .map(u => u.position)

  if (state.tick >= state.totalTick - 1) {
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
    if (!enemyUnits.some(enemy => l1Distance(enemy, unit.position) <= 2)) {
      return {
        type: 'UNIT',
        action: 'MOVE',
        target: randomNeighbor(unit.position),
        unitId: unit.id
      }
    }

    const escapeMove = allNeighbors(unit.position).find(x => state.getTileTypeAt(x) === 'EMPTY')
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

export default holdDumb