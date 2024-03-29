export interface Position {
  x: number;
  y: number;
}

export type TileType = "EMPTY" | "WALL" | "SPAWN";

export interface TickTeamUnitState {
  positionBefore: Position;
  wasVinedBy?: string;
  wasAttackedBy?: string;
}

export interface Unit {
  id: string;
  teamId: string;
  position: Position;
  path: Position[];
  hasDiamond: boolean;
  diamondId?: string;
  hasSpawned: boolean;
  isSummoning: boolean;
  lastState: TickTeamUnitState;
}

export interface Team {
  id: string;
  name: string;
  score: number;
  units: Unit[];
  errors: string[];
}

export interface Diamond {
  id: string;
  position: Position;
  summonLevel: number;
  points: number;
  ownerId?: string;
}

export class TickGameConfig {
  pointsPerDiamond: number = 0;
  maximumDiamondSummonLevel: number = 0;
  initialDiamondSummonLevel: number = 0;
}

export interface GameTick {
  tick: number;
  totalTick: number;
  teams: Team[];
  teamId: string;
  map: {
    tiles: TileType[][];
    diamonds: Diamond[];
  };
  gameConfig: TickGameConfig;
  teamPlayOrderings: TeamPlayOrderings;
}
export interface TeamPlayOrderings {
  [tick: number]: string[];
}

export interface CommandActionUnit {
  type: "UNIT";
  action: "SPAWN" | "MOVE" | "SUMMON" | "DROP" | "VINE" | "ATTACK" | "NONE";
  unitId: string;
  target: Position;
}

export type Action = CommandActionUnit;

export interface GameCommand {
  actions: Action[];
}

export class PointOutOfMapException extends Error {
  constructor(point: Position) {
    super(`Point {${point.x}, ${point.y}} is out of bounds!`);
  }
}

export class GameMessage implements GameTick {
  public readonly tick: number = 0;
  public readonly totalTick: number = 0;
  public readonly teamId: string = "";
  public readonly teams: Team[] = [];
  public readonly map: {
    tiles: TileType[][];
    diamonds: Diamond[];
  } = {} as any;
  public readonly gameConfig: TickGameConfig = {} as any;
  public readonly teamPlayOrderings: TeamPlayOrderings = {};

  constructor(private rawTick: GameTick) {
    Object.assign(this, rawTick);
  }

  public getHorizontalSize(): number {
    return this.map.tiles.length;
  }

  public getVerticalSize(): number {
    return this.map.tiles[0]!.length;
  }

  public doesTileExist(position: Position) {
    return position.x >= 0 && position.x < this.getHorizontalSize()
      && position.y >= 0 && position.y < this.getVerticalSize()
  }

  public getTileTypeAt(position: Position): TileType | null {
    if (!this.doesTileExist(position)) { return null }
    return this.map.tiles[position.x]![position.y]!;
  }

  public getPlayerMapById() {
    return new Map<string, Team>(this.teams.map((team) => [team.id, team]));
  }

  public getSpawnPoints() {
    const spawnPoints: Position[] = [];
    this.map.tiles.forEach((tiles, x) =>
      tiles.forEach((tile, y) => {
        if (tile === "SPAWN") {
          spawnPoints.push({ x, y });
        }
      })
    );
    return spawnPoints;
  }
}
