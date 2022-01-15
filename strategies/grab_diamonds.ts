import { Strategy } from '../strategy-coordinator'
import { Action, TileType, Diamond, Position, Unit, GameMessage } from '../GameInterface'
import { randomNeighbor, areEqual, stringify, getAllUnits, getTeamsWithHigherPriorityNextRound, l1Distance, noop } from '../utils'
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
        if (!returned || !returned.endTarget) { continue }
        let { nextTarget, endTarget, distance } = returned;
        diamonds = diamonds.filter((diamond) => !areEqual(diamond.position, endTarget));

        if (distance === 1) {
            // Check if we're about to get killed in the bloodbath
            const badTeams = getTeamsWithHigherPriorityNextRound(team.id, state)
            const badUnits = state.teams
                .filter(t => badTeams.includes(t.id))
                .flatMap(t => t.units)
                .filter(u => u.hasSpawned && !u.hasDiamond)
                .filter(u => l1Distance(u.position, endTarget) == 2)

            if (badUnits.length) {
                actions.push(noop(unit))
                continue
            }
        }

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