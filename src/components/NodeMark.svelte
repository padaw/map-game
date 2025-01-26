<script lang="ts">
    import { onMount } from "svelte";

    let { type, markOut } = $props<{
        type: MarkedNode["type"];
        markOut: boolean;
    }>();

    let img: HTMLImageElement;

    onMount(() => {
        const handler = () => {
            img.style.display = "none";
        };
        img.addEventListener("animationcancel", handler);
        img.addEventListener("animationend", handler);
    });
</script>

<img
    bind:this={img}
    src={`../../assets/${type}.webp`}
    alt="marked node"
    class:reward={type === "reward"}
    class:penalty={type === "penalty"}
    class:markOut
/>

<style>
    @keyframes markOut {
        10% {
            @apply min-w-40 min-h-40 -top-60;
        }
        75% {
            @apply min-w-6 min-h-6 top-0;
        }
        100% {
            @apply opacity-0;
        }
    }
    img {
        @apply absolute transition-all w-6 h-6 -top-2 -left-1;
    }
    img.markOut {
        animation-duration: 1s;
        animation-name: markOut;
        animation-fill-mode: forwards;
    }
</style>
