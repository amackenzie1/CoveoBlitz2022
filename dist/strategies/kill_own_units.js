"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const search_1 = require("../search");
const killOwnUnits = (units, team, state) => {
    if (state.teams.length !== 2 || state.map.diamonds.every((x) => x.points < 150 || team.units.some(u => !u.hasSpawned))) {
        return [];
    }
    units = units.filter(x => x.hasSpawned && !x.hasDiamond);
    let topDiamond = state.map.diamonds.sort((a, b) => b.points - a.points)[0];
    let returned = search_1.dijkstra(units.map(x => x.position), (x) => utils_1.areEqual(x, topDiamond.position), { state });
    if (returned) {
        return [];
    }
    const isOurUnit = (position) => {
        return team.units.some(u => utils_1.areEqual(u.position, position));
    };
    returned = search_1.dijkstra(units.map(x => x.position), isOurUnit, { state });
    if (!returned) {
        return [];
    }
    const firstPosition = returned.startPosition;
    const secondPosition = returned.endTarget;
    if (utils_1.l1Distance(firstPosition, secondPosition) == 1) {
        let attacker = units.filter(x => {
            return [utils_1.stringify(firstPosition), utils_1.stringify(secondPosition)]
                .includes(utils_1.stringify(x.position));
        }).filter((x) => !x.hasDiamond)[0];
        if (attacker) {
            let other = firstPosition == attacker.position ? secondPosition : firstPosition;
            return [{
                    type: "UNIT",
                    action: "ATTACK",
                    unitId: attacker.id,
                    target: other
                }];
        }
        else {
            return [];
        }
    }
    else {
        let actions = [];
        let firstUnit = units.filter(x => utils_1.areEqual(x.position, firstPosition))[0];
        let secondUnit = units.filter(x => utils_1.areEqual(x.position, secondPosition))[0];
        if (firstUnit && secondUnit) {
            actions.push({
                type: "UNIT",
                action: "MOVE",
                unitId: firstUnit.id,
                target: returned.nextTarget
            });
            actions.push({
                type: "UNIT",
                action: "MOVE",
                unitId: secondUnit.id,
                target: returned.path[returned.path.length - 2]
            });
            return actions;
        }
        else {
            return [];
        }
    }
};
exports.default = killOwnUnits;
//# sourceMappingURL=kill_own_units.js.map