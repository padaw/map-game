<script lang="ts">
    let { isWalkable, moveHandler, n, x, y } = $props<{
        isWalkable: boolean;
        moveHandler: (n: number) => any;
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
></button>

<style>
    .path {
        @apply absolute transition-all border w-6 h-6 m-1 shadow-lg rounded-2xl;
    }
    .path.regular {
        @apply bg-stone-400/60 border-stone-600/60 shadow-stone-800 cursor-default;
    }
    .path.walkable {
        @apply bg-sky-400/90 border-sky-600/90 shadow-sky-800 cursor-pointer;
    }
</style>
