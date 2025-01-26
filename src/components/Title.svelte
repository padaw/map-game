<script lang="ts">
    import type { FormEventHandler } from "svelte/elements";

    let { startHandler } = $props<{ startHandler: (seed: number) => void }>();

    let input: HTMLInputElement;
    let button: HTMLButtonElement;

    let disabled = $state(true);
    let seed = $state<number | null>(null);

    function play() {
        if (disabled || seed === null) {
            return;
        }
        startHandler(seed);
        console.log({ seed });
    }

    const handleInput: FormEventHandler<HTMLInputElement> = (e) => {
        const { value } = e.currentTarget;
        const next = value
            .split("")
            .map(Number)
            .filter((n) => !isNaN(n))
            .join("");

        if (!next.length && seed !== null) {
            e.currentTarget.value = seed.toString();
        } else {
            e.currentTarget.value = next;
            seed = parseInt(next);
        }

        disabled = e.currentTarget.value.length < 1;
    };
</script>

<div
    class="absolute top-0 left-0 bottom-0 right-0 bg-black/75 flex flex-col justify-center items-center"
>
    <h1
        class="text-4xl font-mono font-bold text-lime-200 w-max mb-6"
        style="text-shadow: 2px 4px 12px #000"
    >
        Mystery Island
    </h1>
    <div class="flex w-full justify-center">
        <form
            onsubmit={(e) => {
                e.preventDefault();
                play();
            }}
        >
            <input
                bind:this={input}
                type="number"
                oninput={handleInput}
                autofocus
                class="max-w-32 shrink text-xl font-mono font-black bg-lime-200 border-2 border-lime-700/30 p-2 outline-none focus:bg-lime-100 focus:border-lime-700"
                placeholder="SEED"
            />
            <button
                bind:this={button}
                onclick={play}
                {disabled}
                type="submit"
                class="transition-all text-xl font-mono font-black text-lime-100 px-6 py-2 border-2 border-lime-700/30 bg-gradient-to-br from-lime-500 to-lime-700 shadow-2xl shadow-lime-600 hover:from-lime-200 hover:to-lime-400 hover:text-lime-950 hover:border-lime-200 hover:shadow-lime-200 active:border-lime-950 disabled:from-lime-300 disabled:to-lime-500 disabled:bg-gradient-to-tl disabled:text-lime-700 disabled:shadow-none disabled:border-lime-300/10"
                >PLAY</button
            >
        </form>
    </div>
</div>
