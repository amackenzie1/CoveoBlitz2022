import { Strategy } from '../strategy-coordinator'
import { Action, Diamond, Unit, Team, GameMessage, Position } from '../GameInterface'
import { a_star, SearchAlgorithmReturn, dijkstra } from "../search"
import { freeNeighbors, hasClearLOS, areEqual, getVineRegion, stringify } from '../utils'
import { chooseTarget } from '../Linfty_prioritization'

function diamondValue(diamond: Diamond) {
  return diamond.summonLevel * 20 + diamond.points
}

function averageDistance(diamond: Diamond, units: Unit[], state: GameMessage) {
  let resultToSpawn = dijkstra([diamond.position], pos => (state.getTileTypeAt(pos) === "SPAWN"), { state: state, backwards: true })
  const distanceToSpawn = resultToSpawn ? resultToSpawn.distance : Infinity
  let distances = []
  for (let unit of units) {
    let returned = a_star(unit.position, diamond.position, { state })
    const returnedDistance = returned ? returned.distance : Infinity
    distances.push(Math.min(returnedDistance, distanceToSpawn + 1))
  }
  return distances.reduce((a, b) => a + b, 0) / distances.length
}

function oldChooseTarget(units: Unit[], team: Team, state: GameMessage): Position | null {
  let potentialTargets = state.map.diamonds
    .filter(x => !x.ownerId || !team.units.find(u => u.id === x.ownerId))
    .sort((x, y) => diamondValue(y) - diamondValue(x))
    .slice(0, 2)

  let targetsWithDistances: [Diamond, number][] = []
  for (let target of potentialTargets) {
    targetsWithDistances.push([target, averageDistance(target, units, state)])
  }
  targetsWithDistances.sort((a, b) => a[1] - b[1])

  if (!targetsWithDistances || targetsWithDistances.length === 0) {
    return null
  }
  return targetsWithDistances[0]![0].position
}

const bearPack: Strategy = (units, team, state) => {
  units = units.filter(x => x.hasSpawned && !x.hasDiamond)

  const target = chooseTarget(units, team, state)

  if (!target) { return [] }
  console.log("BEAR Target chosen:", stringify(target))
  const enemyPositions = state.teams
    .filter(t => t.id !== team.id)
    .flatMap(t => t.units)
    .filter(u => u.hasSpawned)
    .map(u => u.position)

  const spawnPoints = state.getSpawnPoints()
  const targetToSpawn = dijkstra(spawnPoints, pos => areEqual(pos, target), { state })?.distance || Infinity
  const targetToEnemy = dijkstra(enemyPositions, pos => areEqual(pos, target), { state })?.distance || Infinity
  const targetVineRegion = getVineRegion(target, state)
  const shouldConsiderVine = Number.isFinite(targetToSpawn) && targetToSpawn + 1 < targetToEnemy

  let actions: Action[] = []
  for (let unit of units) {

    if (shouldConsiderVine) {
      const result = dijkstra([unit.position], pos => !!targetVineRegion.find(pos2 => areEqual(pos, pos2)), { state, backwards: true })
      if (result && result.distance < 10) {
        if (result.distance === 0) {
          actions.push({
            type: 'UNIT',
            action: 'VINE',
            target: target,
            unitId: unit.id
          })
        } else {
          actions.push({
            type: 'UNIT',
            action: 'MOVE',
            target: result.nextTarget,
            unitId: unit.id
          })
        }
        continue
      }
    }

    const result = a_star(unit.position, target, { state, isAttack: true })
    if (!result || !result.endTarget) { continue }

    // Chase the target on-foot
    let targetDiamond = state.map.diamonds.find(d => areEqual(d.position, target))
    if (targetDiamond?.ownerId) {
      actions.push({
        type: 'UNIT',
        action: result.distance <= 1 ? 'ATTACK' : 'MOVE',
        target: result.nextTarget,
        unitId: unit.id
      })
    } else {
      actions.push({
        type: 'UNIT',
        action: 'MOVE',
        target: result.nextTarget,
        unitId: unit.id
      })
    }

  }
  return actions
}

export default bearPack