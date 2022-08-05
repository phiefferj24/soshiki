<script lang="ts">
    export let title = "";
    export let subtitle = "";
    export let collapsing = false;
    export let exiting = false;
    export let dropped = false;

</script>
<div class="list">
    <div class="list-header" class:list-header-dropped={!collapsing || dropped}>
        <span class="list-title">{title}</span>
        <div class="list-column">
            <span class="list-title">{subtitle}</span>
            {#if collapsing}
                <i class="f7-icons list-glyph" on:click={() => dropped = !dropped}>{dropped ? "chevron_up" : "chevron_down"}</i>
            {/if}
            {#if exiting}
                <i class="f7-icons list-glyph" on:click>xmark</i>
            {/if}
        </div>
    </div>
    <div class="list-content" class:list-content-dropped={!collapsing || dropped}>
        <slot />
    </div>
</div>

<style lang=scss>
    @use '../styles/global.scss' as *;
    .list {
        border-radius: 0.5rem;
        border: 2px solid $dropdown-border-color-light;
        @media (prefers-color-scheme: dark) {
            border-color: $dropdown-border-color-dark;
        }

        &-header {
            display: flex;
            justify-content: space-between;
            background-color: $accent-background-color-light;
            font-size: 1.25rem;
            font-weight: bold;
            padding: 0.5rem;
            border-radius: 0.25rem;
            @media (prefers-color-scheme: dark) {
                background-color: $accent-background-color-dark;
            }
            &-dropped {
                border-radius: 0.25rem 0.25rem 0 0;
            }
        }
        &-column {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 0.5rem;
        }
        &-content {
            display: none;
            flex-direction: column;
            &-dropped {
                display: flex;
            }
        }
    }
    [class*="-glyph"] {
        cursor: pointer;
    }
</style>