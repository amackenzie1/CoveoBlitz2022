"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chooseTargetWithValue = exports.chooseTarget = void 0;
const search_1 = require("./search");
const utils_1 = require("./utils");
const chooseTarget = (freeAgentsOrUnspawned, team, state) => {
    return chooseTargetWithValue(freeAgentsOrUnspawned, team, state)?.[0] || null;
};
exports.chooseTarget = chooseTarget;
const chooseTargetWithValue = (freeAgentsOrUnspawned, team, state) => {
    return chooseHeldDiamond(freeAgentsOrUnspawned, team, state) || null;
};
exports.chooseTargetWithValue = chooseTargetWithValue;
const chooseDiamond = (freeAgentsOrUnspawned, ourTeam, state) => {
    const ourUnitPositions = freeAgentsOrUnspawned === 'unspawned'
        ? state.getSpawnPoints()
        : freeAgentsOrUnspawned.map(u => u.position);
    if (!ourUnitPositions.length) {
        return null;
    }
    const enemyFreeAgents = state.teams
        .filter(t => t.id !== ourTeam.id)
        .flatMap(t => t.units)
        .filter(u => u.hasSpawned && !u.hasDiamond)
        .map(u => u.position);
    let heldDiamonds = state.map.diamonds.filter(x => x.ownerId);
    const diamondTeams = {};
    heldDiamonds.forEach(diamond => {
        const t = state.teams.find(t => t.units.find(u => diamond.ownerId === u.id));
        if (t) {
            diamondTeams[diamond.id] = t;
        }
    });
    heldDiamonds = heldDiamonds.filter(d => !!diamondTeams[d.id] && diamondTeams[d.id].id !== ourTeam.id);
    let unheldDiamonds = state.map.diamonds.filter(x => !x.ownerId);
    // rate of growth
    const lambdaLow = 3;
    const lambdaHigh = 5;
    // diamond-to-us
    const distsDTU = {};
    // diamond-to-enemy-of-diamond
    const distsDTEnnD = {};
    // diamond-to-enemy-of-us
    const distsDTEnnU = {};
    const timeOfUnheldDiamond = {};
    const maxHorizon = Math.min(state.totalTick - state.tick, 50);
    const cap = (x) => (x && x < maxHorizon) ? x : Infinity;
    for (let diamond of heldDiamonds) {
        const diamondTeam = diamondTeams[diamond.id];
        const enemiesOfDiamondAndNotUs = state.teams
            .filter(t => t.id !== diamondTeam.id && t.id !== ourTeam.id)
            .flatMap(t => t.units)
            .filter(u => u.hasSpawned && !u.hasDiamond)
            .map(u => u.position);
        const distDiamondToUs = search_1.computeDistance(ourUnitPositions, diamond.position, { state });
        const distDiamondToEnemyOfDiamond = search_1.computeDistance(enemiesOfDiamondAndNotUs, diamond.position, { state });
        const distDiamondToEnemyOfUs = search_1.computeDistance(enemyFreeAgents, diamond.position, { state });
        distsDTU[diamond.id] = cap(distDiamondToUs);
        distsDTEnnD[diamond.id] = cap(distDiamondToEnemyOfDiamond);
        distsDTEnnU[diamond.id] = cap(distDiamondToEnemyOfUs);
    }
    let maxDistDTU = Math.max(...(Object.values(distsDTU).filter(x => Number.isFinite(x))));
    maxDistDTU = Math.min(Number.isFinite(maxDistDTU) ? maxDistDTU : maxHorizon, 10);
    const scoreIfLeftUnchecked = {};
    const ourScoreIfPursued = {};
    for (let diamond of heldDiamonds) {
        scoreIfLeftUnchecked[diamond.id] = diamond.points + lambdaHigh * Math.min(maxDistDTU, distsDTEnnD[diamond.id]);
        if (Number.isFinite(distsDTU[diamond.id])) {
            ourScoreIfPursued[diamond.id] = lambdaLow * Math.min(maxDistDTU - distsDTU[diamond.id], distsDTEnnU[diamond.id]);
        }
    }
    let bestValue = undefined;
    let bestDiamond;
    for (let diamond of heldDiamonds) {
        if (!Number.isFinite(distsDTU[diamond.id])) {
            continue;
        }
        const scoreDiffs = {};
        for (let t of state.teams) {
            let diff;
            if (t.id === ourTeam.id) {
                // Our score diff if we pursue this diamond
                diff = ourScoreIfPursued[diamond.id]
                    + heldDiamonds.filter(d2 => d2.id !== diamond.id && diamondTeams[d2.id].id === t.id)
                        .reduce((sum, d2) => sum + scoreIfLeftUnchecked[d2.id], 0);
            }
            else if (t.id === diamondTeams[diamond.id].id) {
                // The victim's diff if we pursue them
                diff = diamond.points + lambdaHigh * distsDTU[diamond.id]
                    + heldDiamonds.filter(d2 => d2.id !== diamond.id && diamondTeams[d2.id].id === t.id)
                        .reduce((sum, d2) => sum + scoreIfLeftUnchecked[d2.id], 0);
            }
            else {
                // Another team's diff
                diff = heldDiamonds.filter(d2 => diamondTeams[d2.id].id === t.id)
                    .reduce((sum, d2) => sum + scoreIfLeftUnchecked[d2.id], 0);
            }
            scoreDiffs[t.id] = diff;
        }
        const maxFinalScore = Math.max(...state.teams.map(t => t.score + scoreDiffs[t.id]));
        const value = (ourTeam.score + scoreDiffs[ourTeam.id]) - maxFinalScore;
        if (!bestValue || value > bestValue) {
            bestValue = value;
            bestDiamond = diamond;
        }
    }
    for (let diamond of unheldDiamonds) {
        const distsPerTeam = {};
        for (let team of state.teams) {
            const theirFreeAgents = team.id === ourTeam.id
                ? ourUnitPositions
                : team.units.filter(u => u.hasSpawned && !u.hasDiamond).map(u => u.position);
            const dist = search_1.computeDistance(theirFreeAgents, diamond.position, { state });
            distsPerTeam[team.id] = cap(dist);
        }
        const list = Object.entries(distsPerTeam)
            .filter(([_, d]) => Number.isFinite(d))
            .sort(([_, a], [__, b]) => a - b);
        if (list.length === 0) {
            continue;
        }
        if (list.length === 1 && list[0][0] === ourTeam.id) {
            timeOfUnheldDiamond[diamond.id] = maxHorizon - list[0][1];
        }
        if (list.length > 1 && (list[0][0] === ourTeam.id)) {
            timeOfUnheldDiamond[diamond.id] = list[1][1] - list[0][1];
        }
        if (list.length > 1 && (list[1][0] === ourTeam.id)) {
            timeOfUnheldDiamond[diamond.id] = maxHorizon - list[1][1];
        }
    }
    unheldDiamonds = unheldDiamonds.filter(d => !!timeOfUnheldDiamond[d.id]);
    for (let diamond of unheldDiamonds) {
        const scoreDiffs = {};
        for (let t of state.teams) {
            let diff;
            if (t.id === ourTeam.id) {
                // Our score diff if we pursue this diamond
                diff = 4 * timeOfUnheldDiamond[diamond.id]
                    + heldDiamonds.filter(d2 => d2.id !== diamond.id && diamondTeams[d2.id].id === t.id)
                        .reduce((sum, d2) => sum + scoreIfLeftUnchecked[d2.id], 0);
            }
            else {
                // Another team's diff
                diff = heldDiamonds.filter(d2 => diamondTeams[d2.id].id === t.id)
                    .reduce((sum, d2) => sum + scoreIfLeftUnchecked[d2.id], 0);
            }
            scoreDiffs[t.id] = diff;
        }
        const maxFinalScore = Math.max(...state.teams.map(t => t.score + scoreDiffs[t.id]));
        const value = (ourTeam.score + scoreDiffs[ourTeam.id]) - maxFinalScore;
        if (!bestValue || value > bestValue) {
            bestValue = value;
            bestDiamond = diamond;
        }
    }
    if (!bestDiamond) {
        console.log(`!!!???`);
    }
    return bestDiamond ? [bestDiamond.position, bestValue] : null;
};
const chooseHeldDiamond = (freeAgentsOrUnspawned, ourTeam, state) => {
    const ourUnitPositions = freeAgentsOrUnspawned === 'unspawned'
        ? state.getSpawnPoints()
        : freeAgentsOrUnspawned.map(u => u.position);
    if (!ourUnitPositions.length) {
        return null;
    }
    const enemyFreeAgents = state.teams
        .filter(t => t.id !== ourTeam.id)
        .flatMap(t => t.units)
        .filter(u => u.hasSpawned && !u.hasDiamond)
        .map(u => u.position);
    let heldDiamonds = state.map.diamonds.filter(x => x.ownerId);
    const diamondTeams = {};
    heldDiamonds.forEach(diamond => {
        const t = state.teams.find(t => t.units.find(u => diamond.ownerId === u.id));
        if (t) {
            diamondTeams[diamond.id] = t;
        }
    });
    heldDiamonds = heldDiamonds.filter(d => !!diamondTeams[d.id] && diamondTeams[d.id].id !== ourTeam.id);
    // rate of growth
    const lambdaLow = 3;
    const lambdaHigh = 5;
    // diamond-to-us
    const distsDTU = {};
    // diamond-to-enemy-of-diamond
    const distsDTEnnD = {};
    // diamond-to-enemy-of-us
    const distsDTEnnU = {};
    const maxHorizon = Math.min(state.totalTick - state.tick, 50);
    const cap = (x) => (x && x < maxHorizon) ? x : Infinity;
    for (let diamond of heldDiamonds) {
        const diamondTeam = diamondTeams[diamond.id];
        const enemiesOfDiamondAndNotUs = state.teams
            .filter(t => t.id !== diamondTeam.id && t.id !== ourTeam.id)
            .flatMap(t => t.units)
            .filter(u => u.hasSpawned && !u.hasDiamond)
            .map(u => u.position);
        const distDiamondToUs = search_1.computeDistance(ourUnitPositions, diamond.position, { state });
        const distDiamondToEnemyOfDiamond = search_1.computeDistance(enemiesOfDiamondAndNotUs, diamond.position, { state });
        const distDiamondToEnemyOfUs = search_1.computeDistance(enemyFreeAgents, diamond.position, { state });
        distsDTU[diamond.id] = cap(distDiamondToUs);
        distsDTEnnD[diamond.id] = cap(distDiamondToEnemyOfDiamond);
        distsDTEnnU[diamond.id] = cap(distDiamondToEnemyOfUs);
    }
    let maxDistDTU = Math.max(...(Object.values(distsDTU).filter(x => Number.isFinite(x))));
    if (!Number.isFinite(maxDistDTU)) {
        console.log(`NO TARGET TO ANY OF ${heldDiamonds.map(d => utils_1.stringify(d.position)).join(', ')} FROM (${freeAgentsOrUnspawned === 'unspawned'}) ${ourUnitPositions.map(p => utils_1.stringify(p)).join(', ')}`);
        return null;
    }
    maxDistDTU = Math.min(10, maxDistDTU);
    const scoreIfLeftUnchecked = {};
    const ourScoreIfPursued = {};
    for (let diamond of heldDiamonds) {
        scoreIfLeftUnchecked[diamond.id] = diamond.points + lambdaHigh * Math.min(maxDistDTU, distsDTEnnD[diamond.id]);
        if (Number.isFinite(distsDTU[diamond.id])) {
            ourScoreIfPursued[diamond.id] = lambdaLow * Math.min(maxDistDTU - distsDTU[diamond.id], distsDTEnnU[diamond.id]);
        }
    }
    let bestValue = undefined;
    let bestDiamond;
    for (let diamond of heldDiamonds) {
        if (!Number.isFinite(distsDTU[diamond.id])) {
            console.log(`Skipping ${distsDTU[diamond.id]}`);
            continue;
        }
        const scoreDiffs = {};
        for (let t of state.teams) {
            let diff;
            if (t.id === ourTeam.id) {
                // Our score diff if we pursue this diamond
                diff = ourScoreIfPursued[diamond.id]
                    + heldDiamonds.filter(d2 => d2.id !== diamond.id && diamondTeams[diamond.id].id === t.id)
                        .reduce((sum, d2) => sum + scoreIfLeftUnchecked[d2.id], 0);
            }
            else if (t.id === diamondTeams[diamond.id].id) {
                // The victim's diff if we pursue them
                diff = diamond.points + lambdaHigh * distsDTU[diamond.id]
                    + heldDiamonds.filter(d2 => d2.id !== diamond.id && diamondTeams[diamond.id].id === t.id)
                        .reduce((sum, d2) => sum + scoreIfLeftUnchecked[d2.id], 0);
            }
            else {
                // Another team's diff
                diff = heldDiamonds.filter(d2 => diamondTeams[d2.id].id === t.id)
                    .reduce((sum, d2) => sum + scoreIfLeftUnchecked[d2.id], 0);
            }
            scoreDiffs[t.id] = diff;
        }
        const maxFinalScore = Math.max(...state.teams.map(t => t.score + scoreDiffs[t.id]));
        const value = (ourTeam.score + scoreDiffs[ourTeam.id]) - maxFinalScore;
        if (!bestValue || value > bestValue) {
            bestValue = value;
            bestDiamond = diamond;
        }
    }
    if (!bestDiamond) {
        console.log("????????", heldDiamonds.length, heldDiamonds.filter(d => !Number.isFinite(distsDTU[d.id])).length);
    }
    return bestDiamond ? [bestDiamond.position, bestValue] : null;
};
//# sourceMappingURL=Linfty_prioritization.js.map