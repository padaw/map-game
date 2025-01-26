<script lang="ts">
    import { onMount } from "svelte";
    import data from "../../data/map.json";
    import map from "../../assets/map.jpg";
    import { Game } from "../lib/Game.svelte";
    import PathNode from "./PathNode.svelte";
    import Title from "./Title.svelte";

    const game = new Game({
        data,
        rows: 32,
        cols: 32,
        width: 960,
        height: 960,
        startNode: 875,
        // fov: { rows: 4, cols: 4 },
        fov: false,
    });

    let wrapperEl: HTMLDivElement;
    let containerEl: HTMLDivElement;

    onMount(async () => {
        game.place(wrapperEl, containerEl);
        await game.drawMap(map);
        game.center();
        // game.drawGrid();
    });
</script>

<div
    class="relative m-auto w-dvw aspect-[9/10] max-w-[640px] max-h-dvh overflow-hidden border-2 border-zinc-600/40 shadow-2xl shadow-zinc-800 rounded-lg select-none"
    bind:this={wrapperEl}
>
    {#if game.current}
        <div
            class="absolute top-0 left-0 flex flex-col gap-2 w-max z-50 p-4"
            style="text-shadow: 1px 2px 4px #000"
        >
            <div class="flex items-center gap-2 text-lg font-mono">
                <span class="text-lime-100 text-lg">SCORE</span><span
                    class="text-3xl font-black text-lime-200 underline"
                    >300</span
                >
            </div>
        </div>
        <div class="absolute top-0 right-0 p-4 z-50">
            <button
                class="transition-all rounded-full shadow-lg shadow-black grayscale-[25%] hover:grayscale-0 hover:shadow-red-800"
                onclick={() => {}}
            >
                <img src="../../assets/close.png" alt="exit" class="w-7 h-7" />
            </button>
        </div>
    {/if}
    <div
        class="absolute top-0 left-0 w-[960px] h-[960px] transition-all"
        style="transition-duration: 50ms;"
        bind:this={containerEl}
    >
        {#if game.current}
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
                        playerAt={game.current.player.n === path.n}
                        {...path}
                    />
                {/if}
            {/each}
            <img
                alt="player"
                class="transition-all absolute w-8 h-8"
                src="../../assets/player.png"
                style={`top: ${game.current.player.y}px; left: ${game.current.player.x}px`}
            />
        {:else}
            <Title startHandler={game.start.bind(game)} />
        {/if}
    </div>
</div>
