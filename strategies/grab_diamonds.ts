import { Strategy } from '../strategy-coordinator'
import { Action, TileType, Diamond, Position, Unit, GameMessage } from '../GameInterface'
import { randomNeighbor, areEqual, stringify } from '../utils'
import { dijkstra } from "../search"

function getAllUnits(state: GameMessage) {
    let allUnits : Unit [] = []
    for (let team of state.teams){
        allUnits = [...allUnits, ...team.units]
    }
    return allUnits
}


const grabDiamonds: Strategy = (units, team, state) => {
    let takenDiamondStrings : String [] = getAllUnits(state).filter(x => x.hasDiamond).map(x => stringify(x.position))
    units = units.filter(x => x.hasSpawned && !x.hasDiamond)
  
    let diamonds = state.map.diamonds;
    diamonds = diamonds.filter(x => !takenDiamondStrings.includes(stringify(x.position)));

    let actions: Action[] = [];

    function hasDiamond(pos: Position): boolean {
        const diamondPositions: string[] = diamonds.map((diamond) => stringify(diamond.position))
        return diamondPositions.includes(stringify(pos))
    }

    for (let unit of units) {
        let returned = dijkstra([unit.position], state.map.tiles, hasDiamond)
        if (!returned) { continue }
        let { nextTarget, endTarget } = returned;
        diamonds = diamonds.filter((diamond) => !areEqual(diamond.position, endTarget));
        actions.push({
            type: "UNIT",
            action: "MOVE",
            unitId: unit.id,
            target: nextTarget
        })
    }
    return actions;
    }

export default grabDiamonds