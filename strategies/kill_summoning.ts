import { Strategy } from '../strategy-coordinator'
import { Action, Diamond, Position } from '../GameInterface'
import { a_star, dijkstra, SearchAlgorithmReturn } from "../search"
import { freeNeighbors, hasClearLOS, getTeamsWithLowerPriorityThisRound, l1Distance, areEqual } from '../utils'

const killSummoning: Strategy = (units, team, state) => {
  units = units.filter(x => x.hasSpawned && !x.hasDiamond)

  const enemyPositions = state.teams
    .filter(t => t.id !== team.id)
    .flatMap(t => t.units)
    .filter(u => u.hasSpawned && u.hasDiamond && u.isSummoning)
    .map(u => u.position)

  const actions: Action[] = []
  for (let unit of units) {
    const result = dijkstra([unit.position], pos => !!enemyPositions.find(pos2 => areEqual(pos, pos2)), { state, max: 3, isAttack: true })
    if (!result) { continue }

    const { nextTarget, distance } = result
    actions.push({
      type: 'UNIT',
      action: distance <= 1 ? 'ATTACK' : 'MOVE',
      target: nextTarget,
      unitId: unit.id
    })
  }

  return actions
}

export default killSummoning