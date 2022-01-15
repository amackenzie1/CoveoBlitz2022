import { Strategy } from '../strategy-coordinator'
import { Action, GameMessage, TileType, Diamond, Position, Unit, Team } from '../GameInterface'
import { areEqual, stringify, freeNeighbors, getTeamsWithHigherPriorityNextRound, NEIGHBORS, add } from '../utils'
import { computeDistance, dijkstra } from "../search"
import {forAndrew, InsightsProvider} from "../insights"

const NEIGHBORS_AND_SELF = [...NEIGHBORS, { x: 0, y: 0 }]

function probVine(teamId: string, insights: InsightsProvider){
  let vineDiamondHolder = insights.insights(teamId).vineDiamondHolder;
  if (vineDiamondHolder === "high"){
    return 0.3  
  } 
  return 0.1
}

function probSurviveVine(unitPosition: Position, team: Team, state: GameMessage, provider: InsightsProvider) {
  let badTeamIds = getTeamsWithHigherPriorityNextRound(team.id, state)
  let enemyTeams = badTeamIds.map(id => state.teams.find(t => t.id === id)).filter(t => t)
  let enemyPositions = enemyTeams
    .flatMap(t => t!.units)
    .filter(u => !u.hasDiamond && u.hasSpawned)
    .map(u => ([u.position, u.teamId]) as [Position, string])

  const enemyPositionRecord : Record<string, string> = {}
  for (let [pos, teamId] of enemyPositions) {
    enemyPositionRecord[stringify(pos)] = teamId
  }
  
  let probSurvival = 1

  for (let direction of NEIGHBORS) {
    let position = unitPosition
    do {
      position = add(position, direction)
      for (let offset of NEIGHBORS_AND_SELF) {
        let neighbor = add(position, offset)
        if (enemyPositionRecord[stringify(neighbor)]) {
          probSurvival *= (1 - probVine(enemyPositionRecord[stringify(neighbor)]!, provider))
        }
      }
    }
    while (state.getTileTypeAt(position) === "EMPTY")
  }
  return probSurvival
}


const oldGetSafePosition = (unit: Unit, team: Team, state: GameMessage, enemyPositions: Position[]): [Position, number] | null => {
  const validPositions = freeNeighbors(unit.position, state)
    .map<[Position, number]>(pos => [pos, Math.min(...enemyPositions.map(pos2 => computeDistance(pos, pos2, { state, max: 3 }) || Infinity))])
    .sort(([_, a], [__, b]) => b - a)

  return validPositions[0] || null
}


const getSafePosition = (unit: Unit, team: Team, state: GameMessage, enemyPositions: Position[], provider: InsightsProvider): [Position, number] | null => {
  const validPositions = freeNeighbors(unit.position, state)
    .map<[Position, number]>(pos => [pos, Math.min(...enemyPositions.map(pos2 => computeDistance(pos, pos2, { state, max: 3 }) || Infinity))])
    .filter(x => x[1] >= 2) //making sure we can't be attacked 
    .sort((a, b) => probSurviveVine(b[0], team, state, provider) - probSurviveVine(a[0], team, state, provider))

  let allSafe = validPositions.filter(x => probSurviveVine(x[0], team, state, provider) == 1)
  let best = validPositions[0]
  if (!best){return null}
  let bestProb = 1 - probSurviveVine(best[0], team, state, provider)
  let diamond = state.map.diamonds.find(d => d.ownerId === unit.id)
  let value = diamond?.points || 0
  let summonLevel = diamond?.summonLevel || 1;
  let n = value/summonLevel;
  let probDrop = forAndrew(n, bestProb)
  console.log(`Probability of getting vined: ${bestProb}, probability of dropping: ${probDrop}`)
  //with probability probDrop return null 
  if (Math.random() < probDrop){return null}
  return best
}

const holdSimple: Strategy = (units, team, state, provider) => {
  units = units.filter(x => x.hasSpawned && x.hasDiamond)
  if (!units.length) { return [] }

  const enemyUnits = state.teams
    .filter(t => t.id !== team.id)
    .flatMap(t => t.units)
    .filter(u => u.hasSpawned && !u.hasDiamond)
    .map(u => u.position)

  if (state.tick >= state.totalTick - 2) {
    return units.map<Action>(unit => {
      const target = oldGetSafePosition(unit, team, state, enemyUnits)?.[0]
      return {
        type: 'UNIT',
        action: target ? 'DROP' : 'NONE',
        target: target || unit.position,
        unitId: unit.id
      }
    })
  }

  const actions: Action[] = []
  for (let unit of units) {
    const result = dijkstra(enemyUnits, x => areEqual(x, unit.position), { state: state, max: 7 })
    if (!result) { continue }

    const result2 = getSafePosition(unit, team, state, enemyUnits, provider)

    if (result2){
      actions.push({
        type: 'UNIT',
        action: 'MOVE',
        target: result2[0],
        unitId: unit.id
      })
    } else {
      actions.push({
        type: "UNIT",
        action: "DROP",
        target: freeNeighbors(unit.position, state)[0] || unit.position,
        unitId: unit.id
      })
    }
    
  }
  return actions
}

export default holdSimple