import { StrategyCoordinator, GetStrategies } from "../strategy-coordinator";
import randomMoves from "../strategies/dummy_random";
import spawnUnits from "../strategies/spawn_closest_to_diamond";
import grabDiamonds from "../strategies/grab_diamonds";
import holdSimple from "../strategies/hold_simple";
import summonStrategy from "../strategies/simple_summon";
import wolfPack from "../strategies/wolf_pack";

const getStrategies: GetStrategies = () => [
    [spawnUnits, 'SPAWN-UNITS'], 
    [grabDiamonds, 'GRAB-DIAMONDS'], 
    [summonStrategy, 'SUMMON-SIMPLE'], 
    [holdSimple, 'HOLD-SIMPLE'], 
    [wolfPack, 'WOLF-PACK']
]

export default getStrategies