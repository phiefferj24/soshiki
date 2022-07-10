<script lang="ts">
    import { currentMedium } from '$lib/stores';
    const placeholder = `Search ${$currentMedium === 'novel' ? 'light novels' : $currentMedium}`;
    export let value = '';
</script>

<form on:submit|preventDefault>
    <div class="searchbar">
        <input type="search" class="searchbar-search" autocorrect="off" placeholder={placeholder} bind:value />
        <i class="f7-icons searchbar-glyph">search</i>
    </div>
</form>

<style lang="scss">
    @use "../../styles/global.scss" as *;
    .searchbar {
        display: flex;
        width: 100%;
        border-radius: 0.5rem;
        padding: 0.75rem 1rem;
        background-color: $accent-background-color-light;
        color: $text-color-light;
        @media (prefers-color-scheme: dark) {
            background-color: $accent-background-color-dark;
            color: $text-color-dark;
        }
        align-items: center;
        &-search {
            grid-area: search;
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
            grid-area: button;
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
    }
</style>