import { Strategy } from '../strategy-coordinator'
import { Action, Diamond, Position } from '../GameInterface'
import { a_star, SearchAlgorithmReturn } from "../search"
import { freeNeighbors, hasClearLOS } from '../utils'

function diamondValue(diamond: Diamond) {
  return diamond.summonLevel * 20 + diamond.points
}

const wolfPack: Strategy = (units, team, state) => {
  units = units.filter(x => x.hasSpawned && !x.hasDiamond)

  let diamondValues: [Diamond, number][] = []
  for (let diamond of state.map.diamonds) {
    if (team.units.find(x => x.id === diamond.ownerId)) { continue }
    diamondValues.push([diamond, diamondValue(diamond)])
  }
  diamondValues.sort((x, y) => y[1] - x[1])

  if (!diamondValues.length) { return [] }

  let actions: Action[] = []
  outer: for (let unit of units) {
    let index = 0;
    let returned
    do {
      const diamond = diamondValues[index]![0]
      if (diamond.ownerId && hasClearLOS(unit.position, diamond.position, state)) {
        actions.push({
          type: 'UNIT',
          action: 'VINE',
          target: diamond.position,
          unitId: unit.id
        })
        continue outer;
      }

      returned = a_star(unit.position, diamond.position, { state })
      ++index
    } while (!returned && index < diamondValues.length)
    if (!returned) {
      // Kill itself so it respawns
      actions.push({
        type: 'UNIT',
        action: 'ATTACK',
        target: unit.position,
        unitId: unit.id
      })
      continue
    }

    if (returned.distance <= 1 && state.getTileTypeAt(unit.position) === 'SPAWN') {
      // Need to get out of spawn in order to kill
      const target = freeNeighbors(returned.endTarget, state)
        .map<[Position, SearchAlgorithmReturn | null]>(pos => [pos, a_star(unit.position, pos, { state })])
        .filter(([_, result]) => result !== null)
        .sort(([_, a], [__, b]) => a!.distance - b!.distance)[0]?.[1]?.nextTarget

      if (target) {
        actions.push({
          type: 'UNIT',
          action: 'MOVE',
          target: target,
          unitId: unit.id
        })
      } else {
        continue
      }
    }

    actions.push({
      type: "UNIT",
      action: returned.distance <= 1 ? "ATTACK" : "MOVE",
      unitId: unit.id,
      target: returned.nextTarget
    })
  }
  return actions
}

export default wolfPack