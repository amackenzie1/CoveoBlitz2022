"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const search_1 = require("../search");
const Linfty_prioritization_1 = require("../Linfty_prioritization");
const killOwnUnits = (units, team, state) => {
    if (state.teams.length !== 2 || state.map.diamonds.every((x) => x.points < 150 || team.units.some(u => !u.hasSpawned))) {
        return [];
    }
    units = units.filter(x => x.hasSpawned && !x.hasDiamond);
    let result = Linfty_prioritization_1.chooseTargetWithValue(units, team, state);
    let result2 = Linfty_prioritization_1.chooseTargetWithValue('unspawned', team, state);
    if (!(!result && result2) || (result && result2 && result[1] < result2[1])) {
        return [];
    }
    const isOurUnit = (position) => {
        return team.units.some(u => u.hasSpawned && utils_1.areEqual(u.position, position));
    };
    let returned = search_1.dijkstra(units.map(x => x.position), isOurUnit, { state });
    if (!returned || !returned.endTarget || !returned.startPosition) {
        return [];
    }
    console.log(`Looking to KILL-OWN for target ${utils_1.stringify(result2[0])}`);
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