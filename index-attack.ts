// You shouldn't have to modify this code since it only contains the communication between the server and your bot.
// Your code logic should be in ./Bot.ts.
import WebSocket from "ws";
import { Bot } from "./Bot";
import { GameMessage } from "./GameInterface";
import attackCoordinator from './coordinators/only_attack'
import { StrategyCoordinator } from "./strategy-coordinator";

const webSocket = new WebSocket("ws://0.0.0.0:8765");
let bot: Bot;

webSocket.onopen = (event: WebSocket.OpenEvent) => {
  bot = new Bot(new StrategyCoordinator(attackCoordinator));
  if (process.env.TOKEN) {
    webSocket.send(
      JSON.stringify({ type: "REGISTER", token: process.env.TOKEN })
    );
  } else {
    webSocket.send(
      JSON.stringify({ type: "REGISTER", teamName: "ATTACK" })
    );
  }
};

webSocket.onmessage = (message: WebSocket.MessageEvent) => {
  let rawGameMessage = JSON.parse(message.data.toString());
  let gameMessage = new GameMessage(rawGameMessage);

  console.log(`Playing tick ${gameMessage.tick} of ${gameMessage.totalTick}`);

  let myTeam = gameMessage.getPlayerMapById().get(gameMessage.teamId);
  myTeam?.errors.forEach((error) =>
    console.error(`Bot command Error: ${error}`)
  );

  webSocket.send(
    JSON.stringify({
      type: "COMMAND",
      tick: gameMessage.tick,
      actions: bot.getNextMove(gameMessage),
    })
  );
};
