import { Strategy } from '../strategy-coordinator'
import { Action } from '../GameInterface'
import { randomNeighbor } from '../utils'

const randomMoves: Strategy = (units, team, state) => {
  return units
    .filter(x => x.hasSpawned && !x.isSummoning)
    .map<Action>(unit => {
      return {
        type: 'UNIT',
        action: 'MOVE',
        unitId: unit.id,
        target: randomNeighbor(unit.position)
      }
    })
}

export default randomMoves