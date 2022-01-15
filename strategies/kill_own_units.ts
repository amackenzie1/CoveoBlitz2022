import { Strategy } from '../strategy-coordinator'
import { Action, Position } from '../GameInterface'
import { randomNeighbor, areEqual, l1Distance, stringify } from '../utils'
import { dijkstra} from "../search";
import path from 'path';

const killOwnUnits: Strategy = (units, team, state) => {
    if (state.teams.length !== 2 || state.map.diamonds.every((x) => x.points < 150 || team.units.some(u => !u.hasSpawned))) {
        return []
    }
    units = units.filter(x => x.hasSpawned && !x.hasDiamond)

    let topDiamond = state.map.diamonds.sort((a, b) => b.points - a.points)[0]
    
    let returned = dijkstra(units.map(x => x.position), (x) => areEqual(x, topDiamond!.position) , { state })
    
    if (returned){
        return []
    }
    const isOurUnit = (position: Position) => {
        return team.units.some(u => areEqual(u.position, position))
    }

    returned = dijkstra(units.map(x => x.position), isOurUnit, { state })
    if (!returned) {
        return []
    }
    const firstPosition = returned.startPosition;
    const secondPosition = returned.endTarget;
    if (l1Distance(firstPosition, secondPosition) == 1){
        let attacker = units.filter(x => {
            return [stringify(firstPosition), stringify(secondPosition)]
                    .includes(stringify(x.position))
        }).filter((x) => !x.hasDiamond)[0]
        if (attacker){
            let other = firstPosition == attacker.position ? secondPosition : firstPosition
            return [{
                type: "UNIT",
                action: "ATTACK",
                unitId: attacker.id,
                target: other
            }]
        } else {
            return []
        }
    } else {
        let actions : Action [] = []
        let firstUnit = units.filter(x => areEqual(x.position, firstPosition))[0]
        let secondUnit = units.filter(x => areEqual(x.position, secondPosition))[0]
        if (firstUnit && secondUnit){
            actions.push({
                type: "UNIT",
                action: "MOVE",
                unitId: firstUnit.id,
                target: returned.nextTarget
            })
            actions.push({
                type: "UNIT",
                action: "MOVE",
                unitId: secondUnit.id,
                target: returned.path[returned.path.length - 2]!
            })
            return actions
        } else {
            return []
        }
    }
}

export default killOwnUnits 