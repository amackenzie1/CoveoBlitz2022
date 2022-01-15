import { Strategy } from '../strategy-coordinator'
import { Action, Diamond } from '../GameInterface'
import { a_star } from "../search"

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
  console.log(`Diamond values: ${diamondValues.map(x => x[1])}`)

  if (!diamondValues.length) { return [] }

  let actions: Action[] = []
  for (let unit of units) {
    let index = 0;
    let returned
    do {
      returned = a_star(unit.position, diamondValues[index]![0].position, { state })
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