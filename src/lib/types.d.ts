declare interface GameConfig {
    data: NodesData;
    width: number;
    height: number;
    rows: number;
    cols: number;
    startNode: number;
    fov:
        | false
        | {
              rows: number;
              cols: number;
          };
}

declare interface NodesData {
    paths: number[];
    exits: number[];
}

declare interface NodeLocation {
    row: number;
    col: number;
}

declare interface NodePosition extends NodeLocation {
    n: number;
    x: number;
    y: number;
}

declare interface FOVBoundaries {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

declare interface MarkedNode {
    n: number;
    type: "reward" | "penalty";
}
