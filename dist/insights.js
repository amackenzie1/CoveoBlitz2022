"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forAndrew = exports.InsightsProvider = void 0;
const ALL_LOW = {
    killDiamondHolder: 'low',
    vineDiamondHolder: 'low',
    killFreeAgent: 'low',
    vineFreeAgent: 'low',
    dropOnProximity: 'low',
};
const forAndrew = (n, q) => {
    const p = -(q / (1 - q)) * (n * q + 1) / (n * q - 1);
    return (0 <= p && p <= 1) ? p : 1;
};
exports.forAndrew = forAndrew;
const numToBinaryProb = (n) => n <= 1 ? 'low' : 'high';
class InsightsProvider {
    constructor() {
        this.occurrences = {};
    }
    insights(teamId) {
        const occurrences = this.occurrences[teamId];
        return {
            killDiamondHolder: numToBinaryProb(occurrences?.['killDiamondHolder'] || 0),
            vineDiamondHolder: numToBinaryProb(occurrences?.['vineDiamondHolder'] || 0),
            killFreeAgent: numToBinaryProb(occurrences?.['killFreeAgents'] || 0),
            vineFreeAgent: numToBinaryProb(occurrences?.['vineFreeAgents'] || 0),
            dropOnProximity: 'low'
        };
    }
}
exports.InsightsProvider = InsightsProvider;
//# sourceMappingURL=insights.js.map