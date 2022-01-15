"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const search_1 = require("../search");
function getAllUnits(state) {
    let allUnits = [];
    for (let team of state.teams) {
        allUnits = [...allUnits, ...team.units];
    }
    return allUnits;
}
const grabDiamonds = (units, team, state) => {
    let takenDiamondStrings = getAllUnits(state).filter(x => x.hasDiamond).map(x => utils_1.stringify(x.position));
    units = units.filter(x => x.hasSpawned && !x.hasDiamond);
    let diamonds = state.map.diamonds;
    diamonds = diamonds.filter(x => !takenDiamondStrings.includes(utils_1.stringify(x.position)));
    let actions = [];
    function hasDiamond(pos) {
        const diamondPositions = diamonds.map((diamond) => utils_1.stringify(diamond.position));
        return diamondPositions.includes(utils_1.stringify(pos));
    }
    for (let unit of units) {
        let returned = search_1.dijkstra([unit.position], state.map.tiles, hasDiamond);
        if (!returned) {
            continue;
        }
        let { nextTarget, endTarget } = returned;
        diamonds = diamonds.filter((diamond) => !utils_1.areEqual(diamond.position, endTarget));
        actions.push({
            type: "UNIT",
            action: "MOVE",
            unitId: unit.id,
            target: nextTarget
        });
    }
    return actions;
};
exports.default = grabDiamonds;
//# sourceMappingURL=grab_diamonds.js.map