<script lang="ts">
    import { onMount } from "svelte";
    import data from "../../data/map.json";
    import map from "../../assets/map.jpg";
    import { Game } from "../lib/Game.svelte";
    import PathNode from "./PathNode.svelte";

    const game = new Game({
        data,
        rows: 32,
        cols: 32,
        width: 960,
        height: 960,
        startNode: 875,
        fov: { rows: 4, cols: 4 },
        // fov: false,
    });

    let canvasEl: HTMLCanvasElement;
    let layersEl: HTMLCanvasElement;

    onMount(async () => {
        game.setCanvas(canvasEl, layersEl);
        await game.drawMap(map);
        game.start(50300);
        // game.drawGrid();
    });
</script>

<div class="relative m-auto w-[960px] h-[960px] select-none">
    <canvas class="absolute top-0 left-0 -z-20" bind:this={canvasEl}></canvas>
    <canvas class="absolute top-0 left-0 -z-10" bind:this={layersEl}></canvas>
    {#if game.isRunning}
        {#each game.getNodesByLabel("exits") as exit}
            <div
                class="absolute bg-green-600/90 text-white rounded-2xl border-green-400/90 border shadow-green-800 shadow-lg text-center leading-8 w-8 h-8 font-bold font-mono"
                style={`top: ${exit.y}px; left: ${exit.x}px`}
            >
                E
            </div>
        {/each}
        {#each game.getNodesByLabel("paths") as path}
            {#if game.isInFOV(path.n) && game.isDrawablePath(path.n)}
                <PathNode
                    isWalkable={game.isWalkablePath(path.n)}
                    moveHandler={game.move.bind(game)}
                    mark={game.getNodeMark(path.n)}
                    playerAt={game.playerLocation?.n === path.n}
                    {...path}
                />
            {/if}
        {/each}
        {#if game.playerLocation}
            <img
                alt="player"
                class="transition-all absolute w-8 h-8"
                src="../../assets/player.png"
                style={`top: ${game.playerLocation.y}px; left: ${game.playerLocation.x}px`}
            />
        {/if}
    {/if}
</div>
