import { Strategy } from '../strategy-coordinator'
import { Action } from '../GameInterface'

const spawnUnits: Strategy = (units, team, state) => {
  return units
    .filter(x => !x.hasSpawned)
    .map<Action>((unit, idx) => {
      const target = state.getSpawnPoints()[idx]!
      return {
        type: 'UNIT',
        action: 'SPAWN',
        target: target,
        unitId: unit.id
      }
    })
}

export default spawnUnits