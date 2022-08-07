<script lang="ts">
    import { currentMedium } from '$lib/stores';
    import { FilterType, MultiSelectFilter, SingleSelectFilter, SortFilter } from 'soshiki-packages/source';
    import type { Filter, Listing } from 'soshiki-packages/source';
    import { page } from '$app/stores';
    export let placeholder = `Search ${$currentMedium === 'novel' ? 'light novels' : $currentMedium}`;
    export let value = '';
    export let filters: Filter[] | null = null;
    export let listings: Listing[] | null = null;
    export let filtersDropped = false;
    export let listingsDropped = false;

    function click(filter: Filter, index: number) {
        if (filter.type === FilterType.singleSelect) {
            let ssFilter = filter as SingleSelectFilter;
            if (ssFilter.index === index) {
                if (ssFilter.canExclude && ssFilter.excluding || !ssFilter.canExclude) {
                    ssFilter.index = -1;
                } else if (ssFilter.canExclude) {
                    ssFilter.excluding = true;
                }
            } else {
                ssFilter.index = index;
            }
        } else if (filter.type === FilterType.multiSelect) {
            let msFilter = filter as MultiSelectFilter;
            if (msFilter.indices.includes(index)) {
                if (msFilter.canExclude && msFilter.excludings.includes(index) || !msFilter.canExclude) {
                    msFilter.indices = msFilter.indices.filter(i => i !== index);
                    msFilter.excludings = msFilter.excludings.filter(i => i !== index);
                } else if (msFilter.canExclude) {
                    msFilter.excludings.push(index);
                }
            } else {
                msFilter.indices.push(index);
            }
        } else if (filter.type === FilterType.sort) {
            let sFilter = filter as SortFilter;
            if (sFilter.index === index) {
                if (sFilter.canAscend && sFilter.ascending || !sFilter.canAscend) {
                    sFilter.index = -1;
                } else if (sFilter.canAscend) {
                    sFilter.ascending = true;
                }
            } else {
                sFilter.index = index;
            }
        }
        filters = filters;
    }
</script>

<form on:submit|preventDefault>
    <div class="searchbar">
        <div class="searchbar-input">
            <input type="search" class="searchbar-search" autocorrect="off" placeholder={placeholder} bind:value on:input />
            {#if listings && listings.length > 0}
                <i class="f7-icons searchbar-glyph" on:click={() => {listingsDropped = !listingsDropped; filtersDropped = false;}}>list_bullet</i>
            {/if}
            {#if filters && filters.length > 0}
                <i class="f7-icons searchbar-glyph" on:click={() => {filtersDropped = !filtersDropped; listingsDropped = false}}>slider_horizontal_3</i>
            {/if}
            <button type="submit"><i class="f7-icons searchbar-glyph">search</i></button>
        </div>
        {#if filters && filters.length > 0}
            <div class="searchbar-filters" class:searchbar-filters-dropped={filtersDropped}>
                <span class="searchbar-filters-subtitle">Filters</span>
                {#each filters.filter(filter => filter.name !== "Title") as filter}
                    <div class="searchbar-filters-item">
                        <div class="searchbar-filters-header">
                        <span class="searchbar-filters-title">{filter.name}</span>
                            {#if filter.type === FilterType.text}
                                <input class="searchbar-filters-input" type="text" bind:value={filter.value}>
                            {:else}
                                <i class="f7-icons searchbar-filters-glyph" on:click={() => filter["dropped"] = !filter["dropped"]}>{filter["dropped"] ? "chevron_up" : "chevron_down"}</i>
                            {/if}
                        </div>
                        {#if filter.type !== FilterType.text}
                            <div class="searchbar-filters-section" class:searchbar-filters-section-dropped={filter["dropped"]}>
                                {#each filter.value as value, index}
                                    <div class="searchbar-filters-section-item" on:click={() => click(filter, index)}>
                                        <div class="searchbar-filters-section-item-bar searchbar-filters-section-item-bar-{index === 0 ? "first" : (index === filter.value.length - 1 ? "last" : "middle")}"></div>
                                        <span class="searchbar-filters-section-item-title">{value}</span>
                                        <i class="f7-icons searchbar-filters-section-item-glyph">{(() => {
                                            if (filter.type === FilterType.singleSelect) {
                                                if (filter["index"] === index && !filter["excluding"]) return "checkmark";
                                                else if (filter["index"] === index && filter["excluding"]) return "xmark";
                                                else return "";
                                            } else if (filter.type === FilterType.multiSelect) {
                                                if (filter["indices"].includes(index) && !filter["excludings"].includes(index)) return "checkmark";
                                                else if (filter["indices"].includes(index) && filter["excludings"].includes(index)) return "xmark";
                                                else return "";
                                            } else {
                                                if (filter["index"] === index && !filter["ascending"]) return "chevron_down";
                                                else if (filter["index"] === index && filter["ascending"]) return "chevron_up";
                                                else return "";
                                            }
                                        })()}</i>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
        {#if listings && listings.length > 0}
            <div class="searchbar-listings" class:searchbar-listings-dropped={listingsDropped}>
                <span class="searchbar-listings-subtitle">Listings</span>
                <a class="searchbar-listings-item" href="/{$currentMedium}/browse/{$page.params.platform}/{$page.params.source}">
                    <span class="searchbar-listings-title">All</span>
                </a>
                {#each listings as listing}
                    <a class="searchbar-listings-item" href="/{$currentMedium}/browse/{$page.params.platform}/{$page.params.source}/listing/{listing.id}">
                        <span class="searchbar-listings-title">{listing.name}</span>
                    </a>
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
                color: $glyph-hover-color-light;
                @media (prefers-color-scheme: dark) {
                    color: $glyph-hover-color-dark;
                }
            }
        }
        &-filters {
            display: none;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
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
            &-subtitle {
                padding: 0.5rem 0.5rem 0.25rem;
                font-weight: bold;
                color: $accent-text-color-light;
                @media (prefers-color-scheme: dark) {
                    color: $accent-text-color-dark;
                }
            }
            &-item {
                display: flex;
                flex-direction: column;
                width: 100%;
            }
            &-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.25rem 0.5rem;
                font-weight: 600;
            }
            &-glyph {
                cursor: pointer;
                &:hover {
                    color: $glyph-hover-color-light;
                    @media (prefers-color-scheme: dark) {
                        color: $glyph-hover-color-dark;
                    }
                }
            }
            &-section {
                width: 100%;
                display: none;
                flex-direction: column;
                padding: 0.5rem 0;
                &-dropped {
                    display: flex;
                }
                &-item {
                    padding: 0 0.5rem;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 0.5rem;
                    & * {
                        pointer-events: none;
                    }
                    &:hover {
                        background-color: $hover-color-light;
                        @media (prefers-color-scheme: dark) {
                            background-color: $hover-color-dark;
                        }
                    }
                    &-bar {
                        width: 0.25rem;
                        height: 1.75rem;
                        background-color: $glyph-hover-color-light;
                        @media (prefers-color-scheme: dark) {
                            background-color: $glyph-hover-color-dark;
                        }
                        &-first {
                            border-radius: 0.125rem 0.125rem 0 0;
                        }
                        &-last {
                            border-radius: 0 0 0.125rem 0.125rem;
                        }
                    }
                    &-title {
                        padding: 0.25rem 0;
                        font-weight: 600;
                    }
                    &-glyph {
                        margin-left: auto;
                    }
                }
            }
        }
        &-listings {
            display: none;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
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
            &-item {
                & * {
                    pointer-events: none;
                }
                padding: 0.5rem;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                width: 100%;
                &:hover {
                    background-color: $hover-color-light;
                    @media (prefers-color-scheme: dark) {
                        background-color: $hover-color-dark;
                    }
                }
            }
            &-title {
                font-weight: 600;
            }
            &-subtitle {
                padding: 0.5rem 0.5rem 0.25rem;
                font-weight: bold;
                color: $accent-text-color-light;
                @media (prefers-color-scheme: dark) {
                    color: $accent-text-color-dark;
                }
            }
        }
    }
</style>