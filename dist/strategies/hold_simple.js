"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const search_1 = require("../search");
const getDropPosition = (unit, state, enemyPositions) => {
    const validPositions = utils_1.allNeighbors(unit.position)
        .filter(pos => state.getTileTypeAt(pos) === 'EMPTY');
    let desired = 3;
    let preferedPosition;
    do {
        preferedPosition = validPositions
            .filter(pos => !enemyPositions.find(pos2 => utils_1.l1Distance(pos, pos2) >= desired))[0];
        desired--;
    } while (preferedPosition === undefined && desired > 0);
    const target = preferedPosition || validPositions[0];
    return target || null;
};
const holdSimple = (units, team, state) => {
    units = units.filter(x => x.hasSpawned && x.hasDiamond);
    if (!units.length) {
        return [];
    }
    const enemyUnits = state.teams
        .filter(t => t.id !== team.id)
        .flatMap(t => t.units)
        .filter(u => u.hasSpawned && !u.hasDiamond)
        .map(u => u.position);
    if (state.tick >= state.totalTick - 4) {
        return units.map(unit => {
            const target = getDropPosition(unit, state, enemyUnits);
            return {
                type: 'UNIT',
                action: target ? 'DROP' : 'NONE',
                target: target || unit.position,
                unitId: unit.id
            };
        });
    }
    return units.map(unit => {
        const result = search_1.dijkstra(enemyUnits, x => utils_1.areEqual(x, unit.position), { state: state, max: 7 });
        if (!result) {
            console.log(`Nooping ${unit.id} (${utils_1.stringify(unit.position)})`);
            return utils_1.noop(unit);
        }
        const enemyPos = result.startPosition;
        const neighbors = utils_1.freeNeighbors(unit.position, state)
            // sort backwards
            .sort((a, b) => search_1.computeDistance(b, enemyPos, { state }) - search_1.computeDistance(a, enemyPos, { state }));
        console.log(`Need to run ${utils_1.stringify(unit.position)} from ${utils_1.stringify(enemyPos)}: [${neighbors.join(', ')}]`);
        if (neighbors.length) {
            return {
                type: 'UNIT',
                action: 'MOVE',
                target: neighbors[0],
                unitId: unit.id
            };
        }
        if (!enemyUnits.some(enemy => utils_1.l1Distance(enemy, unit.position) <= 2)) {
            return {
                type: 'UNIT',
                action: 'MOVE',
                target: utils_1.randomNeighbor(unit.position),
                unitId: unit.id
            };
        }
        const escapeMove = utils_1.freeNeighbors(unit.position, state)[0];
        if (escapeMove) {
            return {
                type: 'UNIT',
                action: 'MOVE',
                target: escapeMove,
                unitId: unit.id
            };
        }
        return {
            type: 'UNIT',
            action: 'DROP',
            target: unit.position,
            unitId: unit.id
        };
    });
};
exports.default = holdSimple;
//# sourceMappingURL=hold_simple.js.map