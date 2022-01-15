"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const killSelf = (units, team, state) => {
    //with probability 1/4, attack your own square 
    let actions = [];
    for (let unit of units) {
        if (Math.random() < 0.50) {
            actions.push({
                type: 'UNIT',
                action: 'ATTACK',
                target: unit.position,
                unitId: unit.id
            });
        }
    }
    return actions;
};
exports.default = killSelf;
//# sourceMappingURL=kill_self.js.map