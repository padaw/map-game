<script lang="ts">
    import type { FormEventHandler } from "svelte/elements";
    import PlayButton from "./PlayButton.svelte";
    import reward from "../../assets/reward.webp";
    import step from "../../assets/step.webp";
    import penalty from "../../assets/penalty.webp";

    let { startHandler } = $props<{ startHandler: (seed: number) => void }>();

    let button: HTMLButtonElement;

    let isGuideOn = $state(false);

    let disabled = $state(true);
    let seed = $state<number | null>(null);

    function toggleGuide() {
        isGuideOn = !isGuideOn;
    }

    function play() {
        if (disabled || seed === null) {
            return;
        }
        startHandler(seed);
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
    class="absolute top-0 left-0 bottom-0 right-0 bg-black/75 flex flex-col gap-2 lg:gap-6 justify-center items-center"
>
    <h1
        class="text-4xl font-mono font-bold text-lime-200 w-max"
        style="text-shadow: 2px 4px 12px #000"
    >
        Mystery Island
    </h1>
    <div class="flex w-full justify-center" class:hidden={isGuideOn}>
        <form
            onsubmit={(e) => {
                e.preventDefault();
                play();
            }}
        >
            <input
                type="number"
                oninput={handleInput}
                autofocus
                class="max-w-32 shrink text-xl font-mono font-black bg-lime-200 border-2 border-lime-700/30 p-2 outline-none focus:bg-lime-100 focus:border-lime-700"
                placeholder="SEED"
            />
            <PlayButton handler={button!} action={play} {disabled}
                >PLAY</PlayButton
            >
        </form>
    </div>
    {#if !isGuideOn}
        <button class="text-btn" onclick={toggleGuide}>How to play?</button>
    {:else}
        <div
            class="lg:text-lg lg:leading-8 text-justify w-[90%] lg:w-[60%] text-white flex flex-col"
            style="text-shadow: 1px 1px 2px #000"
        >
            <p>
                In Mystery Island, the goal is to reach one of the exit points
                while collecting the most rewards <img
                    src={reward}
                    alt="reward"
                    class="w-4 h-4 inline"
                /> on the way.
            </p>
            <p>
                You'll have to consider your moves carefully as each move <img
                    src={step}
                    alt="step"
                    class="w-4 h-4 inline"
                />
                costs points. Try to collect the most rewards
                <img src={reward} alt="reward" class="w-4 h-4 inline" />
                while avoiding threats
                <img src={penalty} alt="threat" class="w-4 h-4 inline" /> as
                they cost significant points, and reach one of the exit nodes
                <span
                    class="w-4 h-4 text-xs inline-block rounded-full bg-green-600 text-white font-black text-center"
                    style="text-shadow: none">E</span
                > on the map.
            </p>
        </div>
        <button class="text-btn" onclick={toggleGuide}>Go back</button>
    {/if}
</div>

<style>
    .text-btn {
        @apply underline text-lime-100 text-lg hover:text-lime-400 active:text-lime-600;
        text-shadow: 1px 1px 2px #000;
    }
</style>
