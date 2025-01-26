<script lang="ts">
    import { Game } from "../lib/Game.svelte";
    import close from "../../assets/close.webp";
    import HudIcon from "./HudIcon.svelte";

    let { current, exitHandler } = $props<{
        current: GameState;
        exitHandler: () => void;
    }>();
</script>

<div class="absolute top-0 left-0 flex flex-col gap-2 w-max z-50 p-4">
    <div class="flex items-center gap-4 text-lg font-mono">
        <div style="text-shadow: 1px 2px 4px #000">
            <span class="text-lime-100 text-lg mr-2">SCORE</span><span
                class="text-3xl font-black text-lime-200 underline"
                >{current.score}</span
            >
        </div>
        <HudIcon name="step" title={`Each gives ${Game.MOVE_SCORE} score.`}
            >{current.moves}</HudIcon
        >
        <HudIcon name="reward" title={`Each gives ${Game.REWARD_SCORE} score.`}
            >{current.rewards}</HudIcon
        >
        <HudIcon
            name="penalty"
            title={`Each gives ${Game.PENALTY_SCORE} score.`}
            >{current.penalties}</HudIcon
        >
    </div>
</div>
<div class="absolute top-0 right-0 p-4 z-50">
    <button
        class="transition-all rounded-full shadow-lg shadow-black grayscale-[25%] hover:grayscale-0 hover:shadow-red-800"
        onclick={() => {
            if (confirm("Are you sure you want to forfeit the game?")) {
                exitHandler();
            }
        }}
    >
        <img src={close} alt="exit" class="w-7 h-7" />
    </button>
</div>
<div class="absolute bottom-2 right-2 text-zinc-400 text-sm font-bold">
    #{current.seed}
</div>
