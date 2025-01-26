<script lang="ts">
    import type { Snippet } from "svelte";
    import step from "../../assets/step.webp";
    import reward from "../../assets/reward.webp";
    import penalty from "../../assets/penalty.webp";

    let { title, name, children } = $props<{
        name: "step" | "reward" | "penalty";
        title: string;
        children: Snippet;
    }>();

    const dict: Record<typeof name, string> = {
        step: step,
        reward: reward,
        penalty: penalty,
    };
    let img = dict[name];
</script>

<div class="relative w-6 h-6" {title}>
    <img
        src={img}
        alt={name}
        class="absolute top-0 left-0 w-6 h-6 rounded-full shadow-md shadow-black"
    />
    <div
        class="label absolute -bottom-2 -right-2 px-1 text-xs font-mono font-black rounded-md shadow-sm shadow-black"
        class:purple={name === "step"}
        class:red={name === "penalty"}
        class:yellow={name === "reward"}
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
