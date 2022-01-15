import { Unit, Action, GameMessage, Team } from './GameInterface'
import { l1Distance, stringify } from './utils'

type Strategy = (units: Unit[], crew: Team, state: GameMessage) => Action[]
type GetStrategies = (state: GameMessage) => [Strategy, string][]

class StrategyCoordinator {
  public logs: string[][] = []
  constructor(
    private getStrategies: GetStrategies,
  ) { }

  tick(state: GameMessage): Action[] {
    const team = state.teams.find(x => x.id === state.teamId)
    if (!team) {
      console.error(`\n\n\n\nCOULDN'T FIND OUR TEAM ${state.teamId}\n\n\n\n`)
      return []
    }

    let units = [...team.units]
    const strategies = this.getStrategies(state)

    const logs: string[] = []
    const allActions: Action[][] = []
    for (let [strategy, name] of strategies) {
      const actions = strategy(units, team, state)
      const isOk = validateNoCoveoPathfinding(actions, units)
      if (!isOk) {
        logs.push(`Strategy ${name} tried to use COVEO pathfinding`)
        return []
      }

      const claimedUnits = units.filter(x => actions.find(a => a.unitId === x.id))
      logs.push(`Strategy ${name} claimed: [${claimedUnits.map(x => `${x.id} (${x.position ? stringify(x.position) : 'unspawned'})`).join('; ')}]`)

      units = units.filter(x => !actions.find(a => a.unitId === x.id))
      allActions.push(actions)
    }

    logs.push(`Unclaimed units: ${units.map(x => `${x.id} (${x.position ? stringify(x.position) : 'unspawned'})`).join('; ')}}`)

    this.logs.push(logs)
    return allActions.flat()
  }
}

const validateNoCoveoPathfinding = (actions: Action[], units: Unit[]): boolean => {
  for (let action of actions) {
    if (action.action !== 'MOVE') { continue }

    const { target, unitId } = action
    const unitPosition = units.find(u => u.hasSpawned && u.id === unitId)?.position
    if (!unitPosition) { continue }

    if (l1Distance(unitPosition, target) > 1) {
      console.error(`\n\n\n\n\n\nNOOOOOOOOOOOOOOOOOOOOOO\n${JSON.stringify(action)}\n\n\n\n\n\n\n\n`)
      return false
    }
  }

  return true
}

export { StrategyCoordinator }
export type { Strategy, GetStrategies }