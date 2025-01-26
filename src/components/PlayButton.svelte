<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        handler = $bindable(),
        disabled,
        action,
        children,
    } = $props<{
        children: Snippet;
        handler?: any;
        disabled?: boolean;
        action: Function;
    }>();
</script>

<button
    bind:this={handler}
    onclick={action}
    {disabled}
    type="submit"
    class="transition-all text-xl font-mono font-black text-lime-100 px-6 py-2 border-2 border-lime-700/30 bg-gradient-to-br from-lime-500 to-lime-700 shadow-2xl shadow-lime-600 hover:from-lime-200 hover:to-lime-400 hover:text-lime-950 hover:border-lime-200 hover:shadow-lime-200 active:border-lime-950 disabled:from-lime-300 disabled:to-lime-500 disabled:bg-gradient-to-tl disabled:text-lime-700 disabled:shadow-none disabled:border-lime-300/10"
    >{@render children()}</button
>
