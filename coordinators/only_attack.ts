import { StrategyCoordinator, GetStrategies, Strategy } from "../strategy-coordinator";
import { Action, Unit, Position } from '../GameInterface'
import spawnUnits from "../strategies/dummy_spawn";
import attackDumb from "../strategies/dummy_attack";
import { a_star, dijkstra } from '../search'
import { areEqual, stringify } from '../utils'

const getStrategies: GetStrategies = () => [spawnUnits, attackDumb]
export default getStrategies