export class Game {
    private canvasEl?: HTMLCanvasElement;
    private ctx?: CanvasRenderingContext2D;
    private layersCanvasEl?: HTMLCanvasElement;
    private layersCtx?: CanvasRenderingContext2D;

    private nodeW: number;
    private nodeH: number;

    private FOV_ROWS = 4;
    private FOV_COLS = 4;

    private walkableNodes = $state<number[]>([]);
    private fovBounds = $state<FOVBoundaries | null>(null);

    playerLocation = $state<NodePosition | null>(null);

    constructor(
        private data: NodesData,
        readonly width: number,
        readonly height: number,
        readonly gridW: number,
        readonly gridH: number,
    ) {
        this.nodeW = width / gridW;
        this.nodeH = height / gridH;
    }

    setCanvas(primary: HTMLCanvasElement, layers: HTMLCanvasElement) {
        this.canvasEl = primary;
        this.layersCanvasEl = layers;
        primary.width = layers.width = this.width;
        primary.height = layers.height = this.height;
    }

    start(node: number) {
        this.move(node);
    }

    move(node: number) {
        this.playerLocation = this.getPosition(node);
        this.walkableNodes = this.calcWalkablePaths();
        this.fovBounds = this.calcFOV();

        this.drawFOV();
    }

    async drawMap(imgSrc: string) {
        const ctx = this.getCtx();
        const map = new Image(this.width, this.height);
        map.src = imgSrc;
        return new Promise((r) => {
            map.onload = () => {
                ctx.drawImage(map, 0, 0);
                r(null);
            };
        });
    }

    drawPaths() {
        const ctx = this.getCtx();
        for (const n of this.data.paths) {
            const { x, y } = this.getPosition(n);
            ctx.fillStyle = "rgba(0,0,0,.5)";
            ctx.fillRect(x, y, this.nodeW, this.nodeH);
        }
    }

    drawGrid() {
        const ctx = this.getCtx();
        ctx.strokeStyle = "rgba(0,0,0,.75)";
        ctx.font = "bold 10pt mono";
        for (let i = 0; i < this.gridW; i++) {
            for (let j = 0; j < this.gridH; j++) {
                const x = i * this.nodeW;
                const y = j * this.nodeH;
                ctx.strokeRect(x, y, this.nodeW, this.nodeH);
                ctx.fillText(
                    (j * this.gridH + i + 1).toString(),
                    x + this.nodeW / 10,
                    y + this.nodeH / 1.5,
                );
            }
        }
    }

    getNodesByLabel(label: keyof NodesData): NodePosition[] {
        return this.data[label].map(this.getPosition.bind(this));
    }

    isDrawablePath(n: number): boolean {
        return !this.data.exits.includes(n) && this.playerLocation?.n !== n;
    }

    isWalkablePath(n: number): boolean {
        return this.walkableNodes.includes(n);
    }

    isInFOV(n: number): boolean {
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
        const { left, right, top, bottom } = this.fovBounds;

        ctx.clearRect(0, 0, this.width, this.height);

        ctx.beginPath();
        ctx.rect(0, 0, this.width, this.height);
        ctx.roundRect(
            (left - 1) * this.nodeW,
            (top - 1) * this.nodeH,
            (right - left + 1) * this.nodeW,
            (bottom - top + 1) * this.nodeH,
            this.nodeW,
        );

        ctx.fillStyle = "rgba(0,0,0,.75)";
        ctx.fill("evenodd");
    }

    private getLocation(n: number): NodeLocation {
        return {
            row: Math.ceil(n / this.gridW),
            col: n % this.gridW,
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
        const rowStart = (row - 1) * this.gridW + 1;
        const rowEnd = row * this.gridW;
        return nodes.filter((n) => n >= rowStart && n <= rowEnd);
    }

    private calcWalkablePaths(): number[] {
        if (!this.playerLocation) {
            return [];
        }
        const { n } = this.playerLocation;
        return [
            ...this.nodesInSameRow(n, [n - 1, n + 1]),
            ...[n - this.gridW, n + this.gridW]
                .map((x) => [x, ...this.nodesInSameRow(x, [x - 1, x + 1])])
                .flat()
                .filter((x) => this.data.paths.includes(x)),
        ];
    }

    private calcFOV(): FOVBoundaries | null {
        if (!this.playerLocation) {
            return null;
        }
        const { row, col } = this.playerLocation;
        return {
            top: Math.max(0, row - this.FOV_ROWS),
            bottom: Math.min(this.gridH, row + this.FOV_ROWS),
            left: Math.max(0, col - this.FOV_COLS),
            right: Math.min(this.gridW, col + this.FOV_COLS),
        };
    }
}
