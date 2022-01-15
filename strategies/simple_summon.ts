import { Strategy } from '../strategy-coordinator'
import { Action, Team, GameMessage, Position, Unit, Diamond } from '../GameInterface'
import { stringify } from '../utils'
import { dijkstra } from "../search";

function getEnemies(team: Team, state: GameMessage) {
    return state.teams
        .filter(t => t.id !== team.id)
        .flatMap(t => t.units)
        .filter(u => u.hasSpawned)
}

function ticksForSummon(summonLevel: number): number | null {
    if (summonLevel < 5) {
        return summonLevel + 1
    }
    return null
}

function getDiamonds(units: Unit[], diamonds: Diamond[]): [Unit, number][] {
    const ticksMap: Record<string, number | null> = {}
    for (let diamond of diamonds) {
        ticksMap[diamond.id] = ticksForSummon(diamond.summonLevel)
    }
    let unitSummons: [Unit, number][] = []

    for (let unit of units) {
        if (!unit.hasDiamond || !unit.diamondId) { continue }
        const ticks = ticksMap[unit.diamondId!]
        if (!ticks) { continue }
        unitSummons.push([unit, ticks])
    }
    return unitSummons;
}

const summonStrategy: Strategy = (units, team, state) => {
    units = units.filter(x => x.hasSpawned && x.hasDiamond)
    const unitsWithTicks = getDiamonds(units, state.map.diamonds)
    const enemyPositions = getEnemies(team, state).map(x => stringify(x.position));
    const hasEnemy = (position: Position) => enemyPositions.includes(stringify(position));

    let actions: Action[] = [];
    for (let [unit, ticksRequired] of unitsWithTicks) {
        const returned = dijkstra([unit.position], state.map.tiles, hasEnemy, false, ticksRequired+1);
        if (!returned) {
            actions.push({
                type: "UNIT",
                action: "SUMMON",
                unitId: unit.id,
                target: unit.position
            })
            continue
        }

        if (returned.distance <= ticksRequired) { continue }
        
        actions.push({
            type: "UNIT",
            action: "SUMMON",
            unitId: unit.id,
            target: unit.position
        })
    }
    return actions
}

export default summonStrategy