<script lang="ts">
    let starsDiv: HTMLDivElement;
    let stars: HTMLElement[] = new Array(5);
    function mouseMoved(event: MouseEvent) {
        let rect = starsDiv.getBoundingClientRect();
        let x = rect.x;
        let y = rect.y;
        let width = rect.width;
        let height = rect.height;
        let mx = event.clientX;
        let my = event.clientY;
        unscored = typeof score === "undefined";
        if (mx < x || my < y || mx > x + width || my > y + height) return;
        unscored = false;
        for (let starIndex in stars) {
            let star = stars[starIndex];
            let starRect = star.getBoundingClientRect();
            if (mx >= starRect.x + starRect.width * 3 / 4) {
                starValues[starIndex] = 2;
            } else if (mx >= starRect.x + starRect.width / 4) {
                starValues[starIndex] = 1;
            } else {
                starValues[starIndex] = 0;
            }
        }
        starValues = starValues;
    }
    function mouseClicked(event: MouseEvent) {
        mouseMoved(event);
        score = starValues.reduce((accum, num) => accum + num);
        onChange(score);
    }
    function mouseLeft() {
        starValues = [
            Math.min(score ?? 0, 2),
            Math.max(Math.min(score ?? 0, 4) - 2, 0),
            Math.max(Math.min(score ?? 0, 6) - 4, 0),
            Math.max(Math.min(score ?? 0, 8) - 6, 0),
            Math.max(Math.min(score ?? 0, 10) - 8, 0),
        ]
    }
    export let score: number;
    let unscored = typeof score === "undefined";
    export let onChange: (score: number) => void = () => {};
    let starValues = [
        Math.min(score ?? 0, 2),
        Math.max(Math.min(score ?? 0, 4) - 2, 0),
        Math.max(Math.min(score ?? 0, 6) - 4, 0),
        Math.max(Math.min(score ?? 0, 8) - 6, 0),
        Math.max(Math.min(score?? 0, 10) - 8, 0),
    ]
</script>

<svelte:body on:mousemove={event => mouseMoved(event)} />

<div class="stars" bind:this={starsDiv} on:click={event => mouseClicked(event)} on:mouseleave={mouseLeft}>
    {#each starValues as value, index}
        <i class="f7-icons star" bind:this={stars[index]} class:star-gray={unscored}>{value === 0 ? "star" : (value === 1 ? "star_lefthalf_fill" : "star_fill")}</i>
    {/each}
</div>

<style lang="scss">
    @use "../styles/global.scss" as *;
    .stars {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        cursor: pointer;
    }
    .star {
        font-size: 1.25rem;
        pointer-events: none;
        font-weight: 900;
        &-gray {
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
        }
    }
</style>