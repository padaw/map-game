<script lang="ts">
    import { Game } from "../lib/Game.svelte";
    import PlayButton from "./PlayButton.svelte";
    import stars from "../../assets/stars.webp";

    let { game, resetHandler } = $props<{
        game: CompletedGame;
        resetHandler: () => void;
    }>();
</script>

<div
    class="absolute top-0 left-0 bottom-0 right-0 bg-black/75 flex flex-col gap-6 justify-center items-center font-mono"
    style={`background-image: url('${stars}'); background-repeat: no-repeat; background-size: cover;`}
>
    <h1
        class="text-3xl font-bold text-white w-max"
        style="text-shadow: 1px 2px 6px #000"
    >
        CONGRATULATIONS!
    </h1>
    <div style="text-shadow: 1px 2px 6px #000">
        <span class="text-5xl font-bold text-yellow-100">{game.score}</span>
    </div>
    <PlayButton action={resetHandler}>PLAY AGAIN</PlayButton>
    <table
        class="min-w-[60%] text-white text-lg"
        style="text-shadow: 0 1px 1px #000"
    >
        <tbody>
            <tr>
                <td>Starting Score</td>
                <td>{game.startingScore}</td>
            </tr>
            <tr>
                <td>Rewards</td>
                <td><strong>{game.rewards}</strong> * {Game.REWARD_SCORE}</td>
            </tr>
            <tr>
                <td>Penalties</td>
                <td><strong>{game.penalties}</strong> * {Game.PENALTY_SCORE}</td
                >
            </tr>
            <tr>
                <td>Moves</td>
                <td><strong>{game.moves}</strong> * {Game.MOVE_SCORE}</td>
            </tr>
        </tbody>
    </table>
    <span class="text-zinc-400 text-md font-bold">#{game.seed}</span>
</div>
