import { StrategyCoordinator, GetStrategies } from "../strategy-coordinator";
import randomWalk from "../strategies/random_walk";
import spawnUnits from "../strategies/spawn_closest_to_diamond";
import grabDiamonds from "../strategies/grab_diamonds";
import holdSimple from "../strategies/hold_simple";
import summonStrategy from "../strategies/simple_summon";
import killClose from "../strategies/kill_close";
import wolfPack from "../strategies/wolf_pack";

const getStrategies: GetStrategies = () => [
    [spawnUnits, 'SPAWN-UNITS'], 
    [grabDiamonds, 'GRAB-DIAMONDS'], 
    [summonStrategy, 'SUMMON-SIMPLE'], 
    [holdSimple, 'HOLD-SIMPLE'], 
    [killClose, 'KILL-CLOSE'],
    [wolfPack, 'WOLF-PACK'],
    [randomWalk, 'RANDOM-WALK'],
]

export default getStrategies