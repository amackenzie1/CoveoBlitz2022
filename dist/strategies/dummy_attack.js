"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const search_1 = require("../search");
const utils_1 = require("../utils");
const attackDumb = (units, team, state) => {
    let enemyUnitPositions = state.teams
        .filter(t => t.id !== team.id)
        .flatMap(t => t.units)
        .filter(u => u.hasSpawned && u.hasDiamond)
        .map(u => u.position);
    return units.map(unit => {
        const mapped = enemyUnitPositions
            .map(pos => {
            const result = search_1.a_star(unit.position, pos, { state });
            if (!result) {
                return null;
            }
            return [result.nextTarget, result.distance, pos];
        })
            .filter(result => result !== null)
            .sort((resultA, resultB) => resultA[1] - resultB[1]);
        if (!mapped.length) {
            enemyUnitPositions
                .forEach(pos => {
                const result = search_1.a_star(unit.position, pos, { state });
                if (!result) {
                    console.log(`\n\n\nNO PATH FROM ${utils_1.stringify(unit.position)} TO ${utils_1.stringify(pos)}!\n\n\n`);
                }
            });
            return utils_1.noop(unit);
        }
        const [nextTarget, distance, enemyPosition] = mapped[0];
        enemyUnitPositions = enemyUnitPositions.filter(pos => !utils_1.areEqual(pos, enemyPosition));
        return {
            type: 'UNIT',
            action: distance <= 1 ? 'ATTACK' : 'MOVE',
            target: nextTarget,
            unitId: unit.id
        };
    });
};
exports.default = attackDumb;
//# sourceMappingURL=dummy_attack.js.map