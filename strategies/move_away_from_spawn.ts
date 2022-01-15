import { Strategy } from '../strategy-coordinator'
import { Action, Unit, GameMessage } from '../GameInterface'
import { l1Distance, NEIGHBORS, add } from '../utils'

function minL1DistanceToSpawn(unit: Unit, state: GameMessage){
  let minDist = Infinity  
  const tiles = state.map.tiles; 
  for (let x = 0; x < tiles.length; x++){
    for (let y = 0; y < tiles[x]!.length; y++){
      if (tiles[x]![y] !== "SPAWN"){continue}
      minDist = Math.min(minDist, l1Distance(unit.position, {x: x, y: y}))
    }
  }
  return minDist
}

const moveAwayFromSpawn: Strategy = (units, team, state) => {
  units = units.filter(x => x.hasDiamond)
  let actions : Action[] = []
  for (let unit of units){
    const minDist = minL1DistanceToSpawn(unit, state)
    if (minDist >= 4){
      continue
    }
    const neighbors = NEIGHBORS.map(x => add(unit.position, x))
    const betterNeighbors = neighbors.filter(x => minL1DistanceToSpawn(unit, state) < minDist).sort((x, y) => l1Distance(x, unit.position) - l1Distance(y, unit.position))
    if (betterNeighbors.length){
      actions.push({
        type: "UNIT",
        action: "MOVE",
        unitId: unit.id,
        target: betterNeighbors[0]!
      })
    }
  }
  return actions
}

export default moveAwayFromSpawn
