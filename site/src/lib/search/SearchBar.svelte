<script lang="ts">
    import { currentMedium } from '$lib/stores';
    import type { Filter } from 'soshiki-packages/source';
    export let placeholder = `Search ${$currentMedium === 'novel' ? 'light novels' : $currentMedium}`;
    export let value = '';
    export let filters: Filter[] | null = null;
    export let dropped = false;
</script>

<form on:submit|preventDefault>
    <div class="searchbar">
        <div class="searchbar-input">
            <input type="search" class="searchbar-search" autocorrect="off" placeholder={placeholder} bind:value on:input />
            {#if filters && filters.length > 0}
                <i class="f7-icons searchbar-glyph" on:click={() => {dropped = !dropped}}>slider_horizontal_3</i>
            {/if}
            <i class="f7-icons searchbar-glyph">search</i>
        </div>
        {#if filters && filters.length > 0}
            <div class="searchbar-filters" class:searchbar-filters-dropped={dropped}>
                {#each filters as filter}
                {/each}
            </div>
        {/if}
    </div>
</form>

<style lang="scss">
    @use "../../styles/global.scss" as *;
    .searchbar {
        background-color: $accent-background-color-light;
        border: 2px solid $accent-background-color-light;
        @media (prefers-color-scheme: dark) {
            background-color: $accent-background-color-dark;
            border-color: $accent-background-color-dark;
        }
        border-radius: 0.5rem;
        &-input {
            display: flex;
            gap: 1rem;
            width: 100%;
            padding: 0.75rem 1rem;
            align-items: center;
        }
        &-search {
            width: 100%;
            height: 100%;
            appearance: none;
            border: none;
            font-size: 1.25rem;
            font-weight: bold;
            background-color: transparent;
            color: inherit;
            &:focus {
                outline: none;
            }
        }
        &-glyph {
            width: fit-content;
            height: fit-content;
            font-size: 1.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            &:hover {
                background-color: $hover-background-color-light;
                @media (prefers-color-scheme: dark) {
                    color: $accent-text-color-dark;
                    background-color: transparent;
                }
            }
        }
        &-filters {
            display: none;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            gap: 0.25rem;
            width: 100%;
            height: 100%;
            border-radius: 0.25rem;
            background-color: $background-color-light;
            @media (prefers-color-scheme: dark) {
                background-color: $background-color-dark;
            }
            &-dropped {
                display: flex;
            }
        }
    }
</style>