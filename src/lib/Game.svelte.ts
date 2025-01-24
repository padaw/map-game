export class Game {
    private canvasEl?: HTMLCanvasElement;
    private ctx?: CanvasRenderingContext2D;
    private layersCanvasEl?: HTMLCanvasElement;
    private layersCtx?: CanvasRenderingContext2D;

    private nodeW: number;
    private nodeH: number;

    private randGenerator?: () => number;

    private walkableNodes = $state<number[]>([]);
    private fovBounds = $state<FOVBoundaries | null>(null);

    isRunning = $state<boolean>(false);
    playerLocation = $state<NodePosition | null>(null);
    markedNodes = $state<MarkedNode[]>([]);

    constructor(private config: GameConfig) {
        this.nodeW = config.width / config.cols;
        this.nodeH = config.height / config.rows;
    }

    setCanvas(primary: HTMLCanvasElement, layers: HTMLCanvasElement) {
        this.canvasEl = primary;
        this.layersCanvasEl = layers;
        primary.width = layers.width = this.config.width;
        primary.height = layers.height = this.config.height;
    }

    start(seed: number) {
        // https://stackoverflow.com/a/72732727
        let m = 2 ** 35 - 31;
        let a = 185852;
        let s = seed % m;
        this.randGenerator = function () {
            return (s = (s * a) % m) / m;
        };

        this.markedNodes = this.markNodes();
        this.move(this.config.startNode);

        this.isRunning = true;
    }

    move(node: number) {
        this.playerLocation = this.getPosition(node);
        this.walkableNodes = this.calcWalkablePaths();
        this.fovBounds = this.calcFOV();

        this.drawFOV();
        this.applyNodeMark(node);
    }

    async drawMap(imgSrc: string) {
        const ctx = this.getCtx();
        const map = new Image(this.config.width, this.config.height);
        map.src = imgSrc;
        return new Promise((r) => {
            map.onload = () => {
                ctx.drawImage(map, 0, 0);
                r(null);
            };
        });
    }

    drawGrid() {
        const ctx = this.getCtx();
        const { cols, rows } = this.config;
        ctx.strokeStyle = "rgba(0,0,0,.75)";
        ctx.font = "bold 10pt mono";
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = i * this.nodeW;
                const y = j * this.nodeH;
                ctx.strokeRect(x, y, this.nodeW, this.nodeH);
                ctx.fillText(
                    (j * rows + i + 1).toString(),
                    x + this.nodeW / 10,
                    y + this.nodeH / 1.5,
                );
            }
        }
    }

    getNodesByLabel(label: keyof NodesData): NodePosition[] {
        return this.config.data[label].map(this.getPosition.bind(this));
    }

    isDrawablePath(n: number): boolean {
        return !this.config.data.exits.includes(n);
    }

    isWalkablePath(n: number): boolean {
        return this.walkableNodes.includes(n);
    }

    getNodeMark(n: number): MarkedNode | undefined {
        return this.markedNodes.find((m) => m.n === n);
    }

    isInFOV(n: number): boolean {
        if (!this.config.fov) {
            return true;
        }
        if (!this.fovBounds) {
            return false;
        }
        const { col, row } = this.getLocation(n);
        const { left, right, bottom, top } = this.fovBounds;
        return col >= left && col <= right && row >= top && row <= bottom;
    }

    private drawFOV() {
        if (!this.fovBounds) {
            return;
        }
        const ctx = this.getCtx("layers");
        const { width, height } = this.config;
        const { left, right, top, bottom } = this.fovBounds;

        ctx.clearRect(0, 0, width, height);

        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.roundRect(
            (left - 1) * this.nodeW,
            (top - 1) * this.nodeH,
            (right - left + 1) * this.nodeW,
            (bottom - top + 1) * this.nodeH,
            this.nodeW,
        );

        ctx.fillStyle = "rgba(0,0,0,.5)";
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.fill("evenodd");
    }

    private getLocation(n: number): NodeLocation {
        return {
            row: Math.ceil(n / this.config.cols),
            col: n % this.config.cols,
        };
    }

    private getPosition(n: number): NodePosition {
        const { row, col } = this.getLocation(n);
        const x = (col - 1) * this.nodeW;
        const y = (row - 1) * this.nodeH;
        return { n, x, y, row, col };
    }

    private getCtx(
        variant: "primary" | "layers" = "primary",
    ): CanvasRenderingContext2D {
        const ctxKey = variant === "primary" ? "ctx" : "layersCtx";
        const elKey = variant === "primary" ? "canvasEl" : "layersCanvasEl";
        if (this[ctxKey]) {
            return this[ctxKey];
        }
        const ctx = this[elKey]?.getContext("2d");
        if (!ctx) {
            throw new Error("could not get canvas context");
        }
        return (this[ctxKey] = ctx);
    }

    private nodesInSameRow(anchor: number, nodes: number[]): number[] {
        const { row } = this.getLocation(anchor);
        const rowStart = (row - 1) * this.config.cols + 1;
        const rowEnd = row * this.config.cols;
        return nodes.filter((n) => n >= rowStart && n <= rowEnd);
    }

    private calcWalkablePaths(): number[] {
        if (!this.playerLocation) {
            return [];
        }
        const { n } = this.playerLocation;
        return [
            ...this.nodesInSameRow(n, [n - 1, n + 1]),
            ...[n - this.config.cols, n + this.config.cols]
                .map((x) => [x, ...this.nodesInSameRow(x, [x - 1, x + 1])])
                .flat()
                .filter((x) => this.config.data.paths.includes(x)),
        ];
    }

    private calcFOV(): FOVBoundaries | null {
        if (!this.config.fov || !this.playerLocation) {
            return null;
        }
        const { rows: fovRows, cols: fovCols } = this.config.fov;
        const { rows, cols } = this.config;
        const { row, col } = this.playerLocation;
        return {
            top: Math.max(0, row - fovRows),
            bottom: Math.min(rows, row + fovRows),
            left: Math.max(0, col - fovCols),
            right: Math.min(cols, col + fovCols),
        };
    }

    private markNodes(): MarkedNode[] {
        if (!this.randGenerator) {
            return [];
        }
        const { randGenerator: rand } = this;

        const { paths } = this.config.data;
        const indices: number[] = [];
        const marked: MarkedNode[] = [];

        for (let i = 0; i < 20 + rand() * 20; i++) {
            const type = rand() > 0.35 ? "reward" : "penalty";
            let index: number;
            do {
                index = Math.floor(rand() * paths.length);
            } while (index === undefined || indices.includes(index));
            const n = paths[index];
            marked.push({ n, type });
        }

        return marked;
    }

    private applyNodeMark(n: number) {
        const mark = this.getNodeMark(n);
        if (!mark) {
            return;
        }
        setTimeout(() => {
            this.markedNodes = this.markedNodes.filter((m) => m.n !== n);
        }, 1000);
    }
}
