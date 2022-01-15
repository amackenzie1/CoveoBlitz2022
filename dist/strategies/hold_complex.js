"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const search_1 = require("../search");
const insights_1 = require("../insights");
const NEIGHBORS_AND_SELF = [...utils_1.NEIGHBORS, { x: 0, y: 0 }];
function probVine(teamId, insights) {
    let vineDiamondHolder = insights.insights(teamId).vineDiamondHolder;
    if (vineDiamondHolder === "high") {
        return 0.3;
    }
    return 0.1;
}
function probSurviveVine(unitPosition, team, state, provider) {
    let badTeamIds = utils_1.getTeamsWithHigherPriorityNextRound(team.id, state);
    let enemyTeams = badTeamIds.map(id => state.teams.find(t => t.id === id)).filter(t => t);
    let enemyPositions = enemyTeams
        .flatMap(t => t.units)
        .filter(u => !u.hasDiamond && u.hasSpawned)
        .map(u => ([u.position, u.teamId]));
    const enemyPositionRecord = {};
    for (let [pos, teamId] of enemyPositions) {
        enemyPositionRecord[utils_1.stringify(pos)] = teamId;
    }
    let probSurvival = 1;
    for (let direction of utils_1.NEIGHBORS) {
        let position = unitPosition;
        do {
            position = utils_1.add(position, direction);
            for (let offset of NEIGHBORS_AND_SELF) {
                let neighbor = utils_1.add(position, offset);
                if (enemyPositionRecord[utils_1.stringify(neighbor)]) {
                    probSurvival *= (1 - probVine(enemyPositionRecord[utils_1.stringify(neighbor)], provider));
                }
            }
        } while (state.getTileTypeAt(position) === "EMPTY");
    }
    return probSurvival;
}
const oldGetSafePosition = (unit, team, state, enemyPositions) => {
    const validPositions = utils_1.freeNeighbors(unit.position, state)
        .map(pos => [pos, Math.min(...enemyPositions.map(pos2 => search_1.computeDistance(pos, pos2, { state, max: 3 }) || Infinity))])
        .sort(([_, a], [__, b]) => b - a);
    return validPositions[0] || null;
};
function getBestOutOfTotallySafe(totallySafe, enemyUnits, state) {
    let bestValue;
    let bestPosition;
    for (let pos of totallySafe) {
        const value = search_1.computeDistance(enemyUnits, pos, { state }) || Infinity;
        if (!bestValue || value > bestValue) {
            bestValue = value;
            bestPosition = pos;
        }
    }
    return bestPosition;
}
const getSafePosition = (unit, team, state, enemyPositions, provider) => {
    const validPositions = utils_1.freeNeighbors(unit.position, state)
        .map(pos => [pos, Math.min(...enemyPositions.map(pos2 => search_1.computeDistance(pos, pos2, { state, max: 3 }) || Infinity))])
        .filter(x => x[1] >= 2) //making sure we can't be attacked 
        .sort((a, b) => probSurviveVine(b[0], team, state, provider) - probSurviveVine(a[0], team, state, provider));
    let totallySafe = validPositions.filter((x) => probSurviveVine(x[0], team, state, provider) >= 0.8).map((x) => x[0]);
    let best = validPositions[0];
    if (totallySafe.length) {
        const enemyUnits = state.teams
            .filter(t => t.id !== team.id)
            .flatMap(t => t.units)
            .filter(u => u.hasSpawned && !u.hasDiamond)
            .map(u => u.position);
        best = [getBestOutOfTotallySafe(totallySafe, enemyUnits, state), 1];
        console.log("Totally safe!");
    }
    if (!best) {
        return null;
    }
    let bestProb = 1 - probSurviveVine(best[0], team, state, provider);
    let diamond = state.map.diamonds.find(d => d.ownerId === unit.id);
    let value = diamond?.points || 0;
    let summonLevel = diamond?.summonLevel || 1;
    let n = value / summonLevel;
    let probDrop = insights_1.forAndrew(n, bestProb);
    console.log(`Probability of getting vined: ${bestProb}, probability of dropping: ${probDrop}`);
    //with probability probDrop return null 
    if (Math.random() < probDrop) {
        return null;
    }
    return best;
};
const holdSimple = (units, team, state, provider) => {
    units = units.filter(x => x.hasSpawned && x.hasDiamond);
    if (!units.length) {
        return [];
    }
    const enemyUnits = state.teams
        .filter(t => t.id !== team.id)
        .flatMap(t => t.units)
        .filter(u => u.hasSpawned && !u.hasDiamond)
        .map(u => u.position);
    if (state.tick >= state.totalTick - 2) {
        return units.map(unit => {
            const target = oldGetSafePosition(unit, team, state, enemyUnits)?.[0];
            return {
                type: 'UNIT',
                action: target ? 'DROP' : 'NONE',
                target: target || unit.position,
                unitId: unit.id
            };
        });
    }
    const actions = [];
    for (let unit of units) {
        const result = search_1.dijkstra(enemyUnits, x => utils_1.areEqual(x, unit.position), { state: state, max: 7 });
        if (!result) {
            continue;
        }
        const result2 = getSafePosition(unit, team, state, enemyUnits, provider);
        if (result2) {
            actions.push({
                type: 'UNIT',
                action: 'MOVE',
                target: result2[0],
                unitId: unit.id
            });
        }
        else {
            actions.push({
                type: "UNIT",
                action: "DROP",
                target: utils_1.freeNeighbors(unit.position, state)[0] || unit.position,
                unitId: unit.id
            });
        }
    }
    return actions;
};
exports.default = holdSimple;
//# sourceMappingURL=hold_complex.js.map