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

  console.log(state.tick, state.teamPlayOrderings, team.id)

  if (state.tick !== 0 || state.teamPlayOrderings[0]?.[0] === team.id) {
    console.log("SPAWNING PRIMARY")
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


  // Initial tick: choose 2nd best positions to spawn
  console.log('Initial attack but NON-PRIMARY')
  const reservedPositions: Position[] = []
  let diamondsToClaim = [...diamonds]
  let maxDistance = 0;
  for (let unit of unitsToSpawn) {
    const result = dijkstra(diamondsToClaim.map(x => x.position), isSpawnPoint, { state: state, backwards: true })
    if (result) {
      maxDistance = Math.max(maxDistance, result.distance)
      reservedPositions.push(result.endTarget)
      diamondsToClaim = diamondsToClaim.filter(({ position }) => !areEqual(position, result.startPosition))
    }
  }


  let bannedPositions: string[] = [];
  let result
  do {
    result = dijkstra(diamonds.map(x => x.position), (position) => (isSpawnPoint(position) && !bannedPositions.includes(stringify(position))), { state: state, max: maxDistance, backwards: true })
    if (!result || result.distance > maxDistance) { break }
    bannedPositions.push(stringify(result.endTarget))
  } while (result)

  const actions: Action[] = []
  for (let unit of unitsToSpawn) {
    const result = dijkstra(diamonds.map(x => x.position), (position) => (isSpawnPoint(position) && !bannedPositions.includes(stringify(position))), { state: state, backwards: true })
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