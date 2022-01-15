import { GameMessage, Action, Position } from "./GameInterface";
import { StrategyCoordinator } from './strategy-coordinator'
import mainCoordinator from './coordinators/main'
import { InsightsProvider } from './insights'

export class Bot {
  private initializedInsights = false
  private teamPerUnitIds: Record<string, string> = {}
  private allUnitsWithDiamonds: string[] = []
  constructor(
    private readonly coordinator: StrategyCoordinator,
    private readonly times: number[] = [],
    private readonly insights = new InsightsProvider(),
  ) { }

  getNextMove(gameMessage: GameMessage): Action[] {
    try {
      this.collectInsights(gameMessage)
    } catch (error) {
      console.log(`FAILED TO COLLECT INSIGHTS`)
      console.log(error)
    }

    try {
      let currentTime = Date.now()
      const actions = this.coordinator.tick(gameMessage, this.insights)

      this.times.push(Date.now() - currentTime)
      console.log(`Time taken: ${this.times[this.times.length - 1]} ms, maximum time: ${Math.max(...this.times)}ms`)
      return actions
    } catch (error) {
      console.log(`FAILED TO TICK`)
      console.log(error)
      return []
    }
  }

  getLogs(): string[][] {
    return this.coordinator.logs
  }

  collectInsights(gameMessage: GameMessage) {
    const allUnits = gameMessage.teams.flatMap(t => t.units)
    if (!this.initializedInsights) {
      this.teamPerUnitIds = {}
      allUnits.forEach(unit => { this.teamPerUnitIds![unit.id] = unit.teamId })
      this.initializedInsights = true
      gameMessage.teams.forEach(t => {
        this.insights.occurrences[t.id] = {
          killDiamondHolder: 0,
          vineDiamondHolder: 0,
          killFreeAgents: 0,
          vineFreeAgents: 0
        }
      })
    }

    allUnits.forEach(unit => {
      const isDiamondHolder = this.allUnitsWithDiamonds.includes(unit.id)
      const { wasAttackedBy, wasVinedBy } = unit.lastState

      const attackerTeam = this.teamPerUnitIds[wasAttackedBy || '']
      const vinerTeam = this.teamPerUnitIds[wasVinedBy || '']
      if (attackerTeam) {
        this.insights.occurrences[attackerTeam]![isDiamondHolder ? 'killDiamondHolder' : 'killFreeAgents']++
      }
      if (vinerTeam) {
        this.insights.occurrences[vinerTeam]![isDiamondHolder ? 'vineDiamondHolder' : 'vineFreeAgents']++
      }
    })

    this.allUnitsWithDiamonds = allUnits.filter(u => u.hasSpawned && u.hasDiamond).map(u => u.id)
  }
}
