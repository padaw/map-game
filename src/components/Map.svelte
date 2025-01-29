<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import data from "../../data/map.json";
    import map from "../../assets/map.webp";
    import player from "../../assets/player.webp";
    import { Game } from "../lib/Game.svelte";
    import PathNode from "./PathNode.svelte";
    import Title from "./Title.svelte";
    import Hud from "./Hud.svelte";
    import Result from "./Result.svelte";

    const game = new Game({
        data,
        rows: 32,
        cols: 32,
        width: 960,
        height: 960,
        startNode: 875,
        introWaitDuration: 1000,
        // skipIntro: true,
        fov: { rows: 5, cols: 5 },
        // fov: false,
    });

    let wrapperEl: HTMLDivElement;
    let containerEl: HTMLDivElement;

    onMount(async () => {
        game.place(wrapperEl, containerEl);
        await game.drawMap(map);
        // game.drawGrid();
    });
</script>

<div
    class="relative m-auto w-dvw aspect-[9/10] max-w-[960px] max-h-dvh overflow-hidden border-2 border-zinc-600/40 shadow-2xl shadow-zinc-800 rounded-lg select-none"
    bind:this={wrapperEl}
>
    {#if game.past}
        <Result game={game.past} resetHandler={game.clearPastGame.bind(game)} />
    {:else if !game.current}
        <Title startHandler={game.start.bind(game)} />
    {:else if game.current.introInProgress}
        <div class="absolute top-0 left-0 w-full h-full bg-black/80" out:fade>
            <h1
                class="absolute bottom-20 w-full text-center text-lime-200 font-bold font-mono text-3xl"
                style="text-shadow: 2px 4px 12px #000"
            >
                GO TO AN EXIT POSITION
            </h1>
        </div>
    {:else}
        <Hud current={game.current} exitHandler={game.forfeit.bind(game)} />
    {/if}
    <div
        class="absolute top-0 left-0 w-[960px] h-[960px] transition-all"
        style="transition-duration: 200ms;"
        class:-z-10={!game.current}
        bind:this={containerEl}
    >
        {#if game.current}
            {#each game.getNodesByLabel("paths") as path}
                {#if game.isInFOV(path.n) || game.isExitNode(path.n)}
                    <PathNode
                        isWalkable={game.isWalkablePath(path.n)}
                        isExit={game.isExitNode(path.n)}
                        exitOnly={game.current.introInProgress}
                        moveHandler={game.move.bind(game)}
                        markHandler={game.applyNodeMark.bind(game)}
                        mark={game.getNodeMark(path.n)}
                        playerAt={game.current.player.n === path.n}
                        {...path}
                    />
                {/if}
            {/each}
            <img
                alt="player"
                class="transition-all absolute w-8 h-8"
                class:hidden={game.current.introInProgress}
                src={player}
                style={`top: ${game.current.player.y}px; left: ${game.current.player.x}px`}
            />
        {/if}
    </div>
</div>
