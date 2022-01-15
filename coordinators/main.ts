import { StrategyCoordinator, GetStrategies } from "../strategy-coordinator";
import randomWalk from "../strategies/random_walk";
import spawnUnits from "../strategies/spawn_closest";
import spawnStrategic from "../strategies/spawn_strategic";
import grabDiamonds from "../strategies/grab_diamonds";
import holdComplex from "../strategies/hold_complex";
import summonStrategy from "../strategies/simple_summon";
import killClose from "../strategies/kill_close";
import wolfPack from "../strategies/wolf_pack";
import bearPack from "../strategies/bear_pack";
import killAnything from "../strategies/kill_whatever_you_can";

const getStrategies: GetStrategies = (state) => {
    return [
        state.tick > 5 && [spawnStrategic, 'SPAWN-STRATEGIC'],
        [spawnUnits, 'SPAWN-CLOSEST'],
        [killClose, 'KILL-CLOSE'],
        state.tick <= 30 && [grabDiamonds, 'GRAB-DIAMONDS'],
        [summonStrategy, 'SUMMON-SIMPLE'],
        [holdComplex, 'HOLD-COMPLEX'],
        [bearPack, 'BEAR-PACK'],
        [killAnything, "KILL-ANYTHING"],
        [randomWalk, 'RANDOM-WALK'],
    ]

}

export default getStrategies