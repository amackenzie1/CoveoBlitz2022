"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameMessage = exports.PointOutOfMapException = exports.TickGameConfig = void 0;
class TickGameConfig {
    constructor() {
        this.pointsPerDiamond = 0;
        this.maximumDiamondSummonLevel = 0;
        this.initialDiamondSummonLevel = 0;
    }
}
exports.TickGameConfig = TickGameConfig;
class PointOutOfMapException extends Error {
    constructor(point) {
        super(`Point {${point.x}, ${point.y}} is out of bounds!`);
    }
}
exports.PointOutOfMapException = PointOutOfMapException;
class GameMessage {
    constructor(rawTick) {
        this.rawTick = rawTick;
        this.tick = 0;
        this.totalTick = 0;
        this.teamId = "";
        this.teams = [];
        this.map = {};
        this.gameConfig = {};
        this.teamPlayOrderings = {};
        Object.assign(this, rawTick);
    }
    getHorizontalSize() {
        return this.map.tiles.length;
    }
    getVerticalSize() {
        return this.map.tiles[0].length;
    }
    validateTileExists(position) {
        if (position.x < 0 ||
            position.y < 0 ||
            position.x >= this.getHorizontalSize() ||
            position.y >= this.getVerticalSize()) {
            throw new PointOutOfMapException(position);
        }
    }
    getTileTypeAt(position) {
        this.validateTileExists(position);
        return this.map.tiles[position.x][position.y];
    }
    getPlayerMapById() {
        return new Map(this.teams.map((team) => [team.id, team]));
    }
    getSpawnPoints() {
        const spawnPoints = [];
        this.map.tiles.forEach((tiles, x) => tiles.forEach((tile, y) => {
            if (tile === "SPAWN") {
                spawnPoints.push({ x, y });
            }
        }));
        return spawnPoints;
    }
}
exports.GameMessage = GameMessage;
//# sourceMappingURL=GameInterface.js.map