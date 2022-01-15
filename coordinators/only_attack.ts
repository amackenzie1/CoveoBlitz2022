import { GetStrategies } from "../strategy-coordinator";
import spawnUnits from "../strategies/dummy_spawn";
import attackWolf from "../strategies/wolf_pack";

const getStrategies: GetStrategies = () => [
    [spawnUnits, 'SPAWN-UNITS'],
    [attackWolf, 'ATTACK-WOLF']
]
export default getStrategies