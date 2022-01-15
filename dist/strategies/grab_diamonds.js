"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const search_1 = require("../search");
const grabDiamonds = (units, team, state) => {
    units = units.filter(x => x.hasSpawned && !x.hasDiamond);
    let takenDiamondStrings = state.teams
        .flatMap(t => t.units)
        .filter(x => x.hasSpawned && x.hasDiamond)
        .map(x => utils_1.stringify(x.position));
    let diamonds = state.map.diamonds.filter(x => !takenDiamondStrings.includes(utils_1.stringify(x.position)));
    const actions = [];
    const hasDiamond = (pos) => !!diamonds.find(d => utils_1.areEqual(pos, d.position));
    for (let unit of units) {
        let returned = search_1.dijkstra([unit.position], hasDiamond, { state });
        console.log(`Couldn't find path from ${utils_1.stringify(unit.position)} to diamonds ${JSON.stringify(diamonds.map(x => x.position))}`);
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