import { Strategy } from '../strategy-coordinator'
import { Action, GameMessage, Team, Unit, Diamond } from '../GameInterface'
import { } from '../utils'
import { dijkstra, a_star } from "../search"
import PriorityQueue from "ts-priority-queue"

function diamondValue(diamond: Diamond) {
  return diamond.summonLevel * 20 + diamond.points
}

const wolfPack: Strategy = (units, team, state) => {
  let enemies = state.teams
    .filter(t => t.id !== team.id)
    .flatMap(t => t.units)
    .filter(u => u.hasSpawned && u.hasDiamond)

  let diamondValues: [Diamond, number][] = []
  for (let diamond of state.map.diamonds) {
    if (team.units.find(x => x.id === diamond.ownerId)) { continue }
    diamondValues.push([diamond, diamondValue(diamond)])
  }
  diamondValues.sort((x, y) => y[1] - x[1])
  console.log(`Diamond values: ${diamondValues.map(x => x[1])}`)

  if (!diamondValues) { return [] as Action[] }

  let actions: Action[] = []
  units = units.filter(x => x.hasSpawned && !x.hasDiamond)
  for (let unit of units) {
    let index = 0;
    let returned = a_star(unit.position, diamondValues[index]![0].position, state.map.tiles)
    while (index < diamondValues.length && !returned) {
      index += 1
      returned = a_star(unit.position, diamondValues[index]![0].position, state.map.tiles)
    }
    if (!returned) { continue }

    if (returned.distance <= 1) {
      actions.push({
        type: "UNIT",
        action: "ATTACK",
        unitId: unit.id,
        target: returned.nextTarget
      })
    } else {
      actions.push({
        type: "UNIT",
        action: "MOVE",
        unitId: unit.id,
        target: returned.nextTarget
      })
    }
  }
  return actions
}

export default wolfPack