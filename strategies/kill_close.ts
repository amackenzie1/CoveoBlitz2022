import { Strategy } from '../strategy-coordinator'
import { Action, Diamond, Position } from '../GameInterface'
import { a_star, SearchAlgorithmReturn } from "../search"
import { freeNeighbors, hasClearLOS, getTeamsWithLowerPriorityThisRound, l1Distance, areEqual } from '../utils'

const killClose: Strategy = (units, team, state) => {
  units = units.filter(x => x.hasSpawned && !x.hasDiamond)
  const weakTeams = getTeamsWithLowerPriorityThisRound(team.id, state)

  const enemyPositions = state.teams
    .filter(t => weakTeams.includes(t.id))
    .flatMap(t => t.units)
    .filter(u => u.hasSpawned && u.hasDiamond)
    .map(u => u.position)

  const actions: Action[] = []
  const attackedPositions: Position[] = []
  for (let unit of units) {
    const closeTarget = enemyPositions.find(pos => l1Distance(pos, unit.position) === 1)
    if (closeTarget && !attackedPositions.some(pos => areEqual(pos, closeTarget))) {
      actions.push({
        type: 'UNIT',
        action: 'ATTACK',
        target: closeTarget,
        unitId: unit.id
      })
      attackedPositions.push(closeTarget)
    }
  }

  return actions
}

export default killClose