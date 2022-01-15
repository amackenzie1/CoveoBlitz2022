import { Strategy } from '../strategy-coordinator'
import { Action, Position } from '../GameInterface'
import { dijkstra } from '../search'
import { areEqual, stringify } from '../utils'

const spawnUnits: Strategy = (units, team, state) => {
  const unitsToSpawn = units.filter(x => !x.hasSpawned)
  console.log(`${unitsToSpawn.length} units to spawn`)
  if (!unitsToSpawn.length) { return [] }

  let diamonds = [...state.map.diamonds]
  const spawnPoints = state.getSpawnPoints()
  const isSpawnPoint = (pos: Position) => !!spawnPoints.find(x => areEqual(x, pos))

  const actions: Action[] = []
  for (let unit of unitsToSpawn) {
    const result = dijkstra(diamonds.map(x => x.position), state.map.tiles, isSpawnPoint, true)
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