import { GameMessage, Action, Position } from "./GameInterface";
import { StrategyCoordinator } from './strategy-coordinator'
import dummyCoordinator from './coordinators/dummy'

export class Bot {

  private readonly coordinator: StrategyCoordinator

  constructor() {
    this.coordinator = new StrategyCoordinator(dummyCoordinator)
  }

  getNextMove(gameMessage: GameMessage): Action[] {
    const actions = this.coordinator.tick(gameMessage)
    console.log("ACTIONS", JSON.stringify(actions))
    return actions
  }
}
