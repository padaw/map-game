<script lang="ts">
    import type { Snippet } from "svelte";

    let { title, color, name, children } = $props<{
        name: string;
        title: string;
        color: "purple" | "red" | "yellow";
        children: Snippet;
    }>();
</script>

<div class="relative w-6 h-6" {title}>
    <img
        src={`../../assets/${name}.webp`}
        alt={name}
        class="absolute top-0 left-0 w-6 h-6 rounded-full shadow-md shadow-black"
    />
    <div
        class="label absolute -bottom-2 -right-2 px-1 text-xs font-mono font-black rounded-md shadow-sm shadow-black"
        class:purple={color === "purple"}
        class:red={color === "red"}
        class:yellow={color === "yellow"}
    >
        {@render children()}
    </div>
</div>

<style>
    .label.purple {
        @apply text-purple-950 bg-purple-100;
    }
    .label.red {
        @apply text-red-950 bg-red-100;
    }
    .label.yellow {
        @apply text-yellow-950 bg-yellow-100;
    }
</style>
