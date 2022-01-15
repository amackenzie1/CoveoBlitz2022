import { StrategyCoordinator, GetStrategies } from "../strategy-coordinator";
import randomWalk from "../strategies/random_walk";
import spawnUnits from "../strategies/spawn_closest";
import grabDiamonds from "../strategies/grab_diamonds";
import holdComplex from "../strategies/hold_complex";
import summonStrategy from "../strategies/simple_summon";
import killClose from "../strategies/kill_close";
import wolfPack from "../strategies/wolf_pack";

const getStrategies: GetStrategies = (state) => {
    return [
        [spawnUnits, 'SPAWN-UNITS'],
        [killClose, 'KILL-CLOSE'],
        [grabDiamonds, 'GRAB-DIAMONDS'],
        state.tick <= 30 && [summonStrategy, 'SUMMON-SIMPLE'],
        [holdComplex, 'HOLD-COMPLEX'],
        [wolfPack, 'WOLF-PACK'],
        [randomWalk, 'RANDOM-WALK'],
    ]

}

export default getStrategies