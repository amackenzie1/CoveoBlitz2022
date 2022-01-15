import { Strategy } from '../strategy-coordinator'
import { Action, Position } from '../GameInterface'
import { dijkstra } from '../search'
import { areEqual, stringify } from '../utils'
import { chooseTarget } from '../Linfty_prioritization'

const spawnUnits: Strategy = (units, team, state) => {
  const unitsToSpawn = units.filter(x => !x.hasSpawned)
  if (!unitsToSpawn.length) { return [] }

  let diamonds = state.map.diamonds
    .filter(x => !x.ownerId || !team.units.find(u => u.id === x.ownerId))

  let spawnPoints = state.getSpawnPoints()
  const isSpawnPoint = (pos: Position) => !!spawnPoints.find(x => areEqual(x, pos))

  const actions: Action[] = []
  const target = chooseTarget('unspawned', team, state)
  if (!target){ return [] }
  for (let unit of unitsToSpawn) {
    const result = dijkstra(spawnPoints, (x) => (areEqual(x, target)), {state})
    if (!result) { continue }

    const { startPosition, endTarget } = result
    actions.push({
      type: 'UNIT',
      action: 'SPAWN',
      unitId: unit.id,
      target: endTarget
    })

    spawnPoints = spawnPoints.filter((position ) => !areEqual(position, endTarget))
  }

  return actions
}

export default spawnUnits