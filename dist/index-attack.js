"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// You shouldn't have to modify this code since it only contains the communication between the server and your bot.
// Your code logic should be in ./Bot.ts.
const ws_1 = __importDefault(require("ws"));
const Bot_1 = require("./Bot");
const GameInterface_1 = require("./GameInterface");
const only_attack_1 = __importDefault(require("./coordinators/only_attack"));
const strategy_coordinator_1 = require("./strategy-coordinator");
const webSocket = new ws_1.default("ws://0.0.0.0:8765");
let bot;
webSocket.onopen = (event) => {
    bot = new Bot_1.Bot(new strategy_coordinator_1.StrategyCoordinator(only_attack_1.default));
    if (process.env.TOKEN) {
        webSocket.send(JSON.stringify({ type: "REGISTER", token: process.env.TOKEN }));
    }
    else {
        webSocket.send(JSON.stringify({ type: "REGISTER", teamName: "ATTACK" }));
    }
};
webSocket.onmessage = (message) => {
    let rawGameMessage = JSON.parse(message.data.toString());
    let gameMessage = new GameInterface_1.GameMessage(rawGameMessage);
    console.log(`Playing tick ${gameMessage.tick} of ${gameMessage.totalTick}`);
    let myTeam = gameMessage.getPlayerMapById().get(gameMessage.teamId);
    myTeam?.errors.forEach((error) => console.error(`Bot command Error: ${error}`));
    webSocket.send(JSON.stringify({
        type: "COMMAND",
        tick: gameMessage.tick,
        actions: bot.getNextMove(gameMessage),
    }));
};
//# sourceMappingURL=index-attack.js.map