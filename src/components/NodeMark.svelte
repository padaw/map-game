<script lang="ts">
    import { onMount } from "svelte";
    import reward from "../../assets/reward.webp";
    import penalty from "../../assets/penalty.webp";

    let { type, markOut, handler } = $props<{
        type: MarkedNode["type"];
        markOut: boolean;
        handler: () => void;
    }>();

    let img: HTMLImageElement;

    onMount(() => {
        const postAnimation = () => {
            handler();
            img.style.display = "none";
        };
        img.addEventListener("animationcancel", postAnimation);
        img.addEventListener("animationend", postAnimation);
    });
</script>

<img
    bind:this={img}
    src={type === "reward" ? reward : penalty}
    alt="marked node"
    class:reward={type === "reward"}
    class:penalty={type === "penalty"}
    class:markOut
/>

<style>
    @keyframes markOut {
        25% {
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
        animation-duration: 250ms;
        animation-name: markOut;
        animation-fill-mode: forwards;
    }
</style>
