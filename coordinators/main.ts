import { StrategyCoordinator, GetStrategies } from "../strategy-coordinator";
import randomMoves from "../strategies/dummy_random";
import spawnUnits from "../strategies/spawn_closest_to_diamond";
import grabDiamonds from "../strategies/grab_diamonds";
import holdDumb from "../strategies/hold_dumb";
import summonStrategy from "../strategies/simple_summon";
import moveAwayFromSpawn from "../strategies/move_away_from_spawn";

const getStrategies: GetStrategies = () => [spawnUnits, grabDiamonds, moveAwayFromSpawn, summonStrategy, holdDumb]

export default getStrategies