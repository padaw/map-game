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
