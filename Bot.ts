import { GameMessage, Action, Position } from "./GameInterface";
import { StrategyCoordinator } from './strategy-coordinator'
import mainCoordinator from './coordinators/main'

export class Bot {
  constructor(
    private readonly coordinator: StrategyCoordinator,
    private readonly times: number[] = []
  ) { }

  getNextMove(gameMessage: GameMessage): Action[] {
    let currentTime = Date.now()
    const actions = this.coordinator.tick(gameMessage)

    this.times.push(Date.now() - currentTime)
    console.log(`Time taken: ${this.times[this.times.length - 1]} ms, maximum time: ${Math.max(...this.times)}`)
    console.log("ACTIONS", JSON.stringify(actions))

    return actions
  }
}
