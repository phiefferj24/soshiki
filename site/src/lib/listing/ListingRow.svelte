<script lang="ts">
    export let cover: string = '';
    export let title: string = '';
    export let subtitle: string = '';
    export let href: string;
    let imageHeight;
</script>

<a href={href || ""} class="listing-row" on:click>
    <div class="listing-row-image" style:--cover="url({cover})" bind:clientHeight={imageHeight} style:--height="{imageHeight}px"></div>
    <div class="listing-row-content">
        <span class="listing-row-title">{title}</span>
        <span class="listing-row-subtitle">{subtitle}</span>
    </div>
</a>

<style lang="scss">
    @use "../../styles/global.scss" as *;
    .listing-row {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 1rem;
        width: 100%;
        height: 100%;
        padding: 0.5rem;
        &:hover {
            background-color: $hover-color-light;
            @media (prefers-color-scheme: dark) {
                background-color: $hover-color-dark;
            }
        }
        &-image {
            height: 100%;
            width: calc(var(--height) / 3 * 2);
            background-position: center;
            background-size: cover;
            background-repeat: no-repeat;
            border-radius: 0.25rem;
            background-image: var(--cover);
        }
        &-title {
            font-size: 1.25rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        &-subtitle {
            font-size: 1rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
        }
        &-content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            font-weight: bold;
            gap: 0.25rem;
        }
    }
</style>