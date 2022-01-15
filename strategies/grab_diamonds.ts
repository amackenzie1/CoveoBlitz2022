import { Strategy } from '../strategy-coordinator'
import { Action, TileType, Diamond, Position } from '../GameInterface'
import { randomNeighbor, areEqual, stringify } from '../utils'
import { dijkstra } from "../search"

function hasDiamond(pos: Position, diamonds: Diamond[]): boolean {
    const positions: string[] = diamonds.map((diamond) => stringify(diamond.position))
    return positions.includes(stringify(pos))
}

const grabDiamonds: Strategy = (units, team, state) => {
    const 
}

export default randomMoves