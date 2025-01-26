<script lang="ts">
    import NodeMark from "./NodeMark.svelte";

    let { isWalkable, moveHandler, mark, playerAt, n, x, y } = $props<{
        isWalkable: boolean;
        moveHandler: (n: number) => void;
        mark?: MarkedNode;
        playerAt: boolean;
        n: number;
        x: number;
        y: number;
    }>();
</script>

<button
    onclick={isWalkable ? () => moveHandler(n) : null}
    class:walkable={isWalkable}
    class:regular={!isWalkable}
    aria-label="path node"
    class="path"
    style={`top: ${y}px; left: ${x}px`}
>
    {#if mark}
        <NodeMark type={mark.type} markOut={playerAt} />
    {/if}
</button>

<style>
    .path {
        @apply absolute transition-all border w-6 h-6 m-1 shadow-sm rounded-2xl overflow-visible;
    }
    .path.regular {
        @apply bg-stone-400/60 border-stone-600/60 shadow-stone-800/40 cursor-default;
    }
    .path.walkable {
        @apply bg-sky-400/90 border-sky-600/90 shadow-sky-800/40 cursor-pointer;
    }
</style>
