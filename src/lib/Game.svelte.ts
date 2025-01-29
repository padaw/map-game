export class Game {
    private wrapper?: HTMLDivElement;
    private container?: HTMLDivElement;
    private canvas?: GameCanvasDict;

    private offsetX: number = 0;
    private offsetY: number = 0;

    private nodeW: number;
    private nodeH: number;

    static readonly REWARD_SCORE = 100;
    static readonly PENALTY_SCORE = -50;
    static readonly MOVE_SCORE = -10;

    current = $state<GameState | null>(null);
    past = $state<CompletedGame | null>(null);

    constructor(private config: GameConfig) {
        this.nodeW = config.width / config.cols;
        this.nodeH = config.height / config.rows;
    }

    place(wrapper: HTMLDivElement, container: HTMLDivElement) {
        const main = document.createElement("canvas");
        const layers = document.createElement("canvas");

        main.width = this.config.width;
        main.height = this.config.height;
        layers.width = this.config.width;
        layers.height = this.config.height;

        const css = "position: absolute; top: 0; left: 0;";

        main.style.cssText = css;
        layers.style.cssText = css;
        main.style.zIndex = "-20";
        layers.style.zIndex = "-10";

        container.appendChild(main);
        container.appendChild(layers);

        this.wrapper = wrapper;
        this.container = container;
        this.canvas = {
            main: {
                element: main,
                ctx: this.makeCtx(main),
            },
            layers: {
                element: layers,
                ctx: this.makeCtx(layers),
            },
        };

        this.center();
    }

    async start(seed: number) {
        if (!this.container) {
            return;
        }

        // https://stackoverflow.com/a/72732727
        let m = 2 ** 35 - 31;
        let a = 185852;
        let s = seed % m;
        const rand = function () {
            return (s = (s * a) % m) / m;
        };

        const startingScore = this.calcStartingScore();
        const handler = this.panHandler.bind(this);
        const cleanup = () => {
            this.container?.removeEventListener("mousedown", handler);
            this.container?.removeEventListener("touchstart", handler);
        };
        this.current = {
            introInProgress: !this.config.skipIntro,
            fovBounds: null,
            walkable: [],
            marks: [],
            reachedMarks: [],
            moves: 0,
            penalties: 0,
            rewards: 0,
            score: startingScore,
            player: { n: 0, x: 0, y: 0, row: 0, col: 0 },
            startingScore,
            seed,
            rand,
            cleanup,
        };
        this.past = null;

        if (!this.config.skipIntro) {
            for (const exit of this.config.data.exits) {
                this.center(exit);
                await this.pause(this.config.introWaitDuration);
            }
            this.current.introInProgress = false;
        }

        this.current.marks = this.markNodes();
        this.move(this.config.startNode, true);

        this.container.addEventListener("mousedown", handler);
        this.container.addEventListener("touchstart", handler);
    }

    private pause(ms: number): Promise<null> {
        return new Promise((r) => {
            setTimeout(() => {
                r(null);
            }, ms);
        });
    }

    forfeit() {
        if (!this.current) {
            return;
        }

        this.current.cleanup();
        this.current = null;

        const ctx = this.getCtx("layers");
        ctx.clearRect(0, 0, this.config.width, this.config.height);

        this.center();
    }

    clearPastGame() {
        this.past = null;
    }

    move(node: number, hidden: boolean = false) {
        if (!this.current) {
            return;
        }

        if (this.config.data.exits.includes(node)) {
            this.past = {
                moves: this.current.moves,
                penalties: this.current.penalties,
                rewards: this.current.rewards,
                score: this.current.score,
                startingScore: this.current.startingScore,
                seed: this.current.seed,
            };
            this.forfeit();
            return;
        }

        this.current.player = this.getPosition(node);
        this.current.walkable = this.calcWalkablePaths();
        this.current.fovBounds = this.calcFOV();

        this.drawFOV();
        this.center();

        if (!hidden) {
            this.current.moves++;
            this.current.score += Game.MOVE_SCORE;
        }
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

    isExitNode(n: number): boolean {
        return this.config.data.exits.includes(n);
    }

    isWalkablePath(n: number): boolean {
        return !!this.current?.walkable.includes(n);
    }

    getNodeMark(n: number): MarkedNode | undefined {
        if (!this.current) {
            return;
        }
        const mark = this.current.marks.find((m) => m.n === n);
        return this.current.reachedMarks.includes(n) ? undefined : mark;
    }

    applyNodeMark(n: number) {
        if (!this.current) {
            return;
        }
        const mark = this.getNodeMark(n);
        if (!mark || this.current.reachedMarks.includes(n)) {
            return;
        }
        this.current.reachedMarks.push(n);
        if (mark.type === "reward") {
            this.current.score += Game.REWARD_SCORE;
            this.current.rewards++;
        } else {
            this.current.score += Game.PENALTY_SCORE;
            this.current.penalties++;
        }
    }

    isInFOV(n: number): boolean {
        if (!this.config.fov || this.current?.introInProgress) {
            return true;
        }
        if (!this.current?.fovBounds) {
            throw new Error();
        }
        const { col, row } = this.getLocation(n);
        const { left, right, bottom, top } = this.current.fovBounds;
        return col >= left && col <= right && row >= top && row <= bottom;
    }

    private drawFOV() {
        if (!this.current?.fovBounds) {
            return;
        }
        const ctx = this.getCtx("layers");
        const { width, height } = this.config;
        const { left, right, top, bottom } = this.current.fovBounds;

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

    private center(n?: number) {
        if (!this.wrapper) {
            return;
        }
        const { offsetWidth, offsetHeight } = this.wrapper;
        let left: number;
        let top: number;
        if (n || this.current?.player) {
            let x: number;
            let y: number;
            if (!n) {
                x = this.current!.player.x;
                y = this.current!.player.y;
            } else {
                const pos = this.getPosition(n);
                x = pos.x;
                y = pos.y;
            }
            left = -x + offsetWidth / 2;
            top = -y + offsetHeight / 2;
        } else {
            left = (offsetWidth - this.config.width) / 2;
            top = (offsetHeight - this.config.height) / 2;
        }
        this.applyOffset(left, top);
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

    private nodesInSameRow(anchor: number, nodes: number[]): number[] {
        const { row } = this.getLocation(anchor);
        const rowStart = (row - 1) * this.config.cols + 1;
        const rowEnd = row * this.config.cols;
        return nodes.filter((n) => n >= rowStart && n <= rowEnd);
    }

    private calcWalkablePaths(): number[] {
        if (!this.current?.player) {
            return [];
        }
        const { n } = this.current.player;
        return [
            ...this.nodesInSameRow(n, [n - 1, n + 1]),
            ...[n - this.config.cols, n + this.config.cols]
                .map((x) => [x, ...this.nodesInSameRow(x, [x - 1, x + 1])])
                .flat()
                .filter((x) => this.config.data.paths.includes(x)),
        ];
    }

    private calcFOV(): FOVBoundaries | null {
        if (!this.config.fov || !this.current?.player) {
            return null;
        }
        const { rows: fovRows, cols: fovCols } = this.config.fov;
        const { rows, cols } = this.config;
        const { row, col } = this.current.player;
        return {
            top: Math.max(0, row - fovRows),
            bottom: Math.min(rows, row + fovRows),
            left: Math.max(0, col - fovCols),
            right: Math.min(cols, col + fovCols),
        };
    }

    private markNodes(): MarkedNode[] {
        if (!this.current?.player || !this.current.rand) {
            return [];
        }
        const { rand } = this.current;

        const { paths } = this.config.data;
        const nodes: number[] = [];
        const marked: MarkedNode[] = [];

        for (let i = 0; i < 20 + rand() * 40; i++) {
            const type = rand() > 0.35 ? "reward" : "penalty";
            let n: number;
            do {
                const index = Math.floor(rand() * paths.length);
                n = paths[index];
            } while (
                n === undefined ||
                nodes.includes(n) ||
                this.current.player.n === n ||
                this.config.data.exits.includes(n)
            );
            marked.push({ n, type });
        }

        return marked;
    }

    private calcStartingScore(): number {
        // TODO
        return 300;
    }

    private getCtx(
        variant: "main" | "layers" = "main",
    ): CanvasRenderingContext2D {
        if (!this.canvas) {
            throw new Error();
        }
        return this.canvas[variant].ctx;
    }

    private makeCtx(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error();
        }
        return ctx;
    }

    private getPageVals(e: MouseEvent | TouchEvent): [number, number] {
        if ("pageX" in e) {
            return [e.pageX, e.pageY];
        } else {
            const t = e.changedTouches[0];
            return [t.pageX, t.pageY];
        }
    }

    private panHandler(e: MouseEvent | TouchEvent) {
        if (!this.container || ("button" in e && e.button !== 0)) {
            return;
        }

        const td = this.container.style.transitionDuration;
        this.container.style.transitionDuration = "50ms";

        let [baseX, baseY] = this.getPageVals(e);

        const move = (e: MouseEvent | TouchEvent) => {
            const [pageX, pageY] = this.getPageVals(e);
            const dx = Math.round((pageX - baseX) / this.nodeW);
            const dy = Math.round((pageY - baseY) / this.nodeH);
            const nx = Math.floor(Math.abs(dx)) * this.nodeW;
            const ny = Math.floor(Math.abs(dy)) * this.nodeH;
            if (nx || ny) {
                let left = this.offsetX;
                let top = this.offsetY;
                if (nx) {
                    left = dx < 0 ? left - nx : left + nx;
                }
                if (ny) {
                    top = dy < 0 ? top - ny : top + ny;
                }
                baseX = pageX;
                baseY = pageY;
                this.applyOffset(left, top);
            }
            e.preventDefault();
        };

        const cleaner = () => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("touchmove", move);
            if (this.container) {
                this.container.style.transitionDuration = td;
            }
        };

        document.addEventListener("mousemove", move);
        document.addEventListener("touchmove", move);
        document.addEventListener("mouseup", cleaner, { once: true });
        document.addEventListener("touchend", cleaner, { once: true });
        document.addEventListener("touchcancel", cleaner, { once: true });
    }

    private applyOffset(x: number, y: number) {
        if (!this.wrapper || !this.container) {
            throw new Error();
        }
        const { offsetWidth: width, offsetHeight: height } = this.wrapper;
        x = Math.min(0, x);
        y = Math.min(0, y);
        this.offsetX = Math.max(x, width - this.config.width);
        this.offsetY = Math.max(y, height - this.config.height);
        this.container.style.left = `${this.offsetX}px`;
        this.container.style.top = `${this.offsetY}px`;
    }
}
