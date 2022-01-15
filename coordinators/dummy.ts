import { StrategyCoordinator, GetStrategies } from "../strategy-coordinator";
import randomMoves from "../strategies/dummy_random";
import spawnUnits from "../strategies/dummy_spawn";

const getStrategies: GetStrategies = () => [spawnUnits, randomMoves]

export default getStrategies