import { Strategy } from '../strategy-coordinator'
import { Action, TileType, Diamond, Position, Unit, GameMessage } from '../GameInterface'
import { randomNeighbor, areEqual, stringify, getAllUnits } from '../utils'
import { dijkstra } from "../search"


const grabDiamonds: Strategy = (units, team, state) => {
    units = units.filter(x => x.hasSpawned && !x.hasDiamond)
    let takenDiamondStrings: String[] = state.teams
        .flatMap(t => t.units)
        .filter(x => x.hasSpawned && x.hasDiamond)
        .map(x => stringify(x.position))

    let diamonds = state.map.diamonds.filter(x => !takenDiamondStrings.includes(stringify(x.position)));

    const actions: Action[] = [];
    const hasDiamond = (pos: Position): boolean => !!diamonds.find(d => areEqual(pos, d.position))

    for (let unit of units) {
        let returned = dijkstra([unit.position], hasDiamond, { state })
        console.log(`Couldn't find path from ${stringify(unit.position)} to diamonds ${JSON.stringify(diamonds.map(x => x.position))}`)
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