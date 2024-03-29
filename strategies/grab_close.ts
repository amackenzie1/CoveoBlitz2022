import { Strategy } from '../strategy-coordinator'
import { Action, TileType, Diamond, Position, Unit, GameMessage } from '../GameInterface'
import { randomNeighbor, areEqual, stringify, getAllUnits, getTeamsWithHigherPriorityNextRound, noop } from '../utils'
import { dijkstra, computeDistance } from "../search"

const grabDiamondClose: Strategy = (units, team, state) => {
    units = units.filter(x => x.hasSpawned && !x.hasDiamond)

    const enemyUnits = state.teams
        .filter(t => t.id !== team.id)
        .flatMap(t => t.units)
        .filter(u => u.hasSpawned)
        .map(u => u.position)

    let diamonds = state.map.diamonds.filter(x => !x.ownerId);

    const actions: Action[] = [];
    const hasDiamond = (pos: Position): boolean => !!diamonds.find(d => areEqual(pos, d.position))

    for (let unit of units) {
        let returned = dijkstra([unit.position], hasDiamond, { state, max: 10 })
        if (!returned || !returned.endTarget) {
            continue
        }

        let { nextTarget, endTarget, distance } = returned;
        const distToEnemy = computeDistance(enemyUnits, endTarget, { state, max: distance })
        if (!distToEnemy || distToEnemy > distance) {
            diamonds = diamonds.filter((diamond) => !areEqual(diamond.position, endTarget));
            actions.push({
                type: "UNIT",
                action: "MOVE",
                unitId: unit.id,
                target: nextTarget
            })
        }
    }
    return actions;
}

export default grabDiamondClose