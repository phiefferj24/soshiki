<script lang="ts">
    import { page } from "$app/stores";
    import * as Sources from "$lib/sources";
    import type * as MangaSource from "soshiki-packages/manga/mangaSource";
    import * as Source from "soshiki-packages/source";
    import { onMount } from "svelte";
    import SearchBar from "$lib/search/SearchBar.svelte";
    import ListingCard from "$lib/listing/ListingCard.svelte";
    import manifest from "$lib/manifest";
import LoadingBar from "$lib/LoadingBar.svelte";
    let medium = $page.params.medium;
    let sourceId = $page.params.source;
    let platform = $page.params.platform;
    let source = Sources.sources[medium][platform].find(s => s.id === sourceId) as MangaSource.MangaSource;
    let mounted = false;
    let list: MangaSource.MangaPageResult;
    async function init() {
        list = await source.getMangaList([], 1);
        mounted = true;
    }
    onMount(init);
    let searchText: string;
    async function updateMangaList() {
        let filters: Source.Filter[] = [];
        if (searchText && searchText.length > 0) {
            filters.push(new Source.TextFilter("Title", searchText));
        }
        list = await source.getMangaList(filters, 1);
    }
</script>

{#if mounted}
    <SearchBar placeholder="Search {source.name}" on:submit={updateMangaList} bind:value={searchText} filters={[]}/>
    <div class="results">
        {#each list.manga as manga}
            <div class="result">
                <ListingCard 
                    title={manga.title || ""}
                    subtitle={manga.author || ""}
                    cover={`${manifest.proxy.url}/${manga.cover}` || ""}
                    href={`/${medium}/browse/${platform}/${sourceId}/id/${manga.id}/info`}
                />
            </div>
        {:else}
            <h1>No results.</h1>
        {/each}
    </div>
{:else}
    <LoadingBar />
{/if}

<style lang="scss">
    .results {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 2rem;
        margin-top: 2rem;
    }
    .result {
        width: 10rem;
        height: 15rem;
    }
</style>