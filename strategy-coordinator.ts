import { Unit, Action, GameMessage, Team } from './GameInterface'

type Strategy = (units: Unit[], crew: Team, state: GameMessage) => Action[]
type GetStrategies = (state: GameMessage) => Strategy[]

class StrategyCoordinator {
  constructor(
    private getStrategies: GetStrategies
  ) { }

  tick(state: GameMessage): Action[] {
    const team = state.teams.find(x => x.id === state.teamId)
    if (!team) {
      console.error(`COULDN'T FIND OUR TEAM ${state.teamId}`)
      return []
    }

    let units = [...team.units]
    const strategies = this.getStrategies(state)

    const allActions: Action[][] = []
    for (let strategy of strategies) {
      const actions = strategy(units, team, state)
      units = units.filter(x => !actions.find(a => a.unitId === x.id))
      allActions.push(actions)
    }

    return allActions.flat()
  }
}

export { StrategyCoordinator }
export type { Strategy, GetStrategies }