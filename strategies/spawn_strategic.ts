import { Strategy } from '../strategy-coordinator'
import { Action, Position } from '../GameInterface'
import { dijkstra } from '../search'
import { areEqual, stringify } from '../utils'

const spawnUnits: Strategy = (units, team, state) => {
  const unitsToSpawn = units.filter(x => !x.hasSpawned)
  if (!unitsToSpawn.length) { return [] }

  let diamonds = state.map.diamonds
    .filter(x => !x.ownerId || !team.units.find(u => u.id === x.ownerId))

  const spawnPoints = state.getSpawnPoints()
  const isSpawnPoint = (pos: Position) => !!spawnPoints.find(x => areEqual(x, pos))

  const actions: Action[] = []
  for (let unit of unitsToSpawn) {
    const result = dijkstra(diamonds.map(x => x.position), isSpawnPoint, { state: state, backwards: true })
    if (!result) { continue }

    const { startPosition, endTarget } = result
    actions.push({
      type: 'UNIT',
      action: 'SPAWN',
      unitId: unit.id,
      target: endTarget
    })

    diamonds = diamonds.filter(({ position }) => !areEqual(position, startPosition))
  }

  return actions
}

export default spawnUnits