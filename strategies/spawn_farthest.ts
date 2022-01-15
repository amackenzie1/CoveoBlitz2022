import { Strategy } from '../strategy-coordinator'
import { Action, Position } from '../GameInterface'
import { dijkstra, computeDistance } from '../search'
import { areEqual, stringify, } from '../utils'

const spawnFarthest: Strategy = (units, team, state) => {
  const unitToSpawn = units.filter(x => !x.hasSpawned)[0]
  if (!unitToSpawn) { return [] }

  let diamonds = state.map.diamonds.filter(x => !x.ownerId)

  const allEnemies = state.teams
    .filter(t => t.id !== team.id)
    .flatMap(t => t.units)
    .filter(u => u.hasSpawned)
    .map(u => u.position)

  const spawnPoints = state.getSpawnPoints()

  const isSpawnPoint = (pos: Position) => !!spawnPoints.find(x => areEqual(x, pos))


  const result = diamonds
    .map<Position | null>(diamond => {
      const distToEnemies = computeDistance(allEnemies, diamond.position, { state })
      const distToSpawn = computeDistance(spawnPoints, diamond.position, { state })

      if (!distToSpawn || distToSpawn > 8) { return null }
      if (distToEnemies && distToEnemies < 20) { return null }
      return diamond.position
    })
    .filter(x => x)[0]

  if (!result) { return [] }

  const baba = dijkstra([result], isSpawnPoint, { state, backwards: true })
  if (!baba) { return [] }

  return [{
    type: 'UNIT',
    action: 'SPAWN',
    target: baba.endTarget,
    unitId: unitToSpawn.id
  }]
}


export default spawnFarthest