<script lang="ts">
    import { onMount } from "svelte";
    import data from "../../data/map.json";
    import map from "../../assets/map.jpg";
    import { Game } from "../lib/Game.svelte";
    import Path from "./Path.svelte";

    const game = new Game(data, 960, 960, 32, 32);

    let canvasEl: HTMLCanvasElement;
    let layersEl: HTMLCanvasElement;

    onMount(async () => {
        game.setCanvas(canvasEl, layersEl);
        await game.drawMap(map);
        game.start(875);
        // game.drawGrid();
        // game.drawPaths();
    });
</script>

<div class="relative m-auto w-[960px] h-[960px] select-none">
    <canvas class="absolute top-0 left-0 -z-20" bind:this={canvasEl}></canvas>
    <canvas class="absolute top-0 left-0 -z-10" bind:this={layersEl}></canvas>
    {#each game.getNodesByLabel("exits") as exit}
        <div
            class="absolute bg-green-600/90 text-white rounded-2xl border-green-400/90 border shadow-green-800 shadow-lg text-center leading-8 w-8 h-8 font-bold font-mono"
            style={`top: ${exit.y}px; left: ${exit.x}px`}
        >
            E
        </div>
    {/each}
    {#each game.getNodesByLabel("paths") as path}
        {#if game.isDrawablePath(path.n)}
            <Path
                isWalkable={game.isWalkablePath(path.n)}
                isInFOV={game.isInFOV(path.n)}
                moveHandler={game.move.bind(game)}
                {...path}
            />
        {/if}
    {/each}
    {#if game.playerLocation}
        <div
            class="transition-all absolute border shadow-xl bg-rose-600 border-rose-800 shadow-rose-950 w-8 h-8"
            style={`top: ${game.playerLocation.y}px; left: ${game.playerLocation.x}px`}
        ></div>
    {/if}
</div>
