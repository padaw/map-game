export class Game {
    private canvasEl?: HTMLCanvasElement;
    private ctx?: CanvasRenderingContext2D;
    private nodeW: number;
    private nodeH: number;

    playerLocation = $state<NodePosition | null>(null);
    walkableNodes = $state<number[]>([]);

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

    setCanvas(canvasEl: HTMLCanvasElement) {
        this.canvasEl = canvasEl;
        this.canvasEl.width = this.width;
        this.canvasEl.height = this.height;
    }

    start(node: number) {
        this.move(node);
    }

    move(node: number) {
        this.playerLocation = this.getPosition(node);
        this.walkableNodes = this.calcWalkablePaths();
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

    getPosition(n: number): NodePosition {
        const ny = Math.floor(n / this.gridH);
        const nx = n - ny * this.gridW - 1;
        const x = nx * this.nodeW;
        const y = ny * this.nodeH;
        return { n, x, y };
    }

    private getCtx(): CanvasRenderingContext2D {
        if (this.ctx) {
            return this.ctx;
        }
        const ctx = this.canvasEl?.getContext("2d");
        if (!ctx) {
            throw new Error("could not get canvas context");
        }
        return (this.ctx = ctx);
    }

    private nodesInSameRow(anchor: number, nodes: number[]): number[] {
        const row = Math.ceil(anchor / this.gridW);
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
}
