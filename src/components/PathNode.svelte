<script lang="ts">
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
        <img
            src={`../../assets/${mark.type}.png`}
            alt="marked node"
            class:reward={mark.type === "reward"}
            class:penalty={mark.type === "penalty"}
            class:markOut={playerAt}
        />
    {/if}
</button>

<style>
    @keyframes markOut {
        10% {
            @apply min-w-40 min-h-40 -top-60;
        }
        75% {
            @apply min-w-6 min-h-6 top-0;
        }
        100% {
            @apply opacity-50;
        }
    }
    .path {
        @apply absolute transition-all border w-6 h-6 m-1 shadow-sm rounded-2xl overflow-visible;
    }
    .path.regular {
        @apply bg-stone-400/60 border-stone-600/60 shadow-stone-800/40 cursor-default;
    }
    .path.walkable {
        @apply bg-sky-400/90 border-sky-600/90 shadow-sky-800/40 cursor-pointer;
    }
    img {
        @apply absolute transition-all w-6 h-6 -top-2 -left-1;
    }
    img.markOut {
        animation-duration: 1.5s;
        animation-name: markOut;
    }
</style>
