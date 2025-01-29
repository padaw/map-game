<script lang="ts">
    import NodeMark from "./NodeMark.svelte";

    let {
        isWalkable,
        isExit,
        exitOnly,
        moveHandler,
        mark,
        playerAt,
        markHandler,
        n,
        x,
        y,
    } = $props<{
        isWalkable: boolean;
        isExit: boolean;
        exitOnly: boolean;
        moveHandler: (n: number) => void;
        mark?: MarkedNode;
        playerAt: boolean;
        markHandler: (n: number) => void;
        n: number;
        x: number;
        y: number;
    }>();
</script>

{#if !exitOnly || isExit}
    <button
        onclick={isWalkable ? () => moveHandler(n) : null}
        class:walkable={isWalkable}
        class:regular={!isWalkable}
        class:exit={isExit}
        class:exitOnly
        aria-label="path node"
        class="path"
        style={`top: ${y}px; left: ${x}px`}
    >
        {#if isExit}
            E
        {/if}
        {#if mark}
            <NodeMark
                type={mark.type}
                markOut={playerAt}
                handler={() => markHandler(n)}
            />
        {/if}
    </button>
{/if}

<style>
    .path {
        @apply absolute transition-all border w-6 h-6 m-1 shadow-sm rounded-full overflow-visible;
    }
    .path.regular {
        @apply bg-stone-400/60 border-stone-600/60 shadow-stone-800/40 cursor-default;
    }
    .path.walkable {
        @apply bg-sky-400/90 border-sky-600/90 shadow-sky-800/40 cursor-pointer;
    }
    .path.exit {
        @apply text-center leading-8 w-8 h-8 font-bold font-mono m-0;
        text-shadow: 1px 1px 4px #000;
    }
    .path.regular.exit {
        @apply text-white/90 bg-green-600/60 border-green-700/60 shadow-green-800/40;
    }
    .path.walkable.exit,
    .path.exit.exitOnly {
        @apply text-white bg-green-600 border-green-400 shadow-green-800;
    }
</style>
