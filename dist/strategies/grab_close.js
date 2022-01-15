"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const search_1 = require("../search");
const grabDiamondClose = (units, team, state) => {
    units = units.filter(x => x.hasSpawned && !x.hasDiamond);
    let diamonds = state.map.diamonds.filter(x => !x.ownerId);
    const actions = [];
    const hasDiamond = (pos) => !!diamonds.find(d => utils_1.areEqual(pos, d.position));
    for (let unit of units) {
        let returned = search_1.dijkstra([unit.position], hasDiamond, { state, max: 3 });
        if (!returned || !returned.endTarget) {
            continue;
        }
        let { nextTarget, endTarget, distance } = returned;
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
exports.default = grabDiamondClose;
//# sourceMappingURL=grab_close.js.map