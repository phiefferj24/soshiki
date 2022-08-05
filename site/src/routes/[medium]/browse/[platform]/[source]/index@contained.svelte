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
    import { FilterBase } from "soshiki-packages/manga/aidoku-ts/models/filter";
    import Filter from "$lib/search/Filter.svelte";
    let medium = $page.params.medium;
    let sourceId = $page.params.source;
    let platform = $page.params.platform;
    let source = Sources.sources[medium][platform].find(s => s.id === sourceId) as MangaSource.MangaSource;
    let mounted = false;
    let currentPage = 1;
    let gettingMore = false;
    let hasMore = true;
    let list: MangaSource.Manga[];
    let filters: Source.Filter[] = [];
    let listings: Source.Listing[] = [];
    async function init() {
        let q = $page.url.searchParams.get("q");
        if (q) {
            searchText = q;
            await updateMangaList();
        } else {
            let res = await source.getMangaList([], currentPage);
            list = res.manga;
            hasMore = res.hasMore;
        }
        filters = await source.getFilters();
        filters.forEach(filter => filter["dropped"] = false);
        listings = await source.getListings();
        mounted = true;
    }
    onMount(init);
    let searchText: string;
    let cachedSearchText = "";
    async function updateMangaList() {
        filters = filters.filter(filter => filter.name !== "Title");
        if (searchText && searchText.length > 0) {
            filters.push(new Source.TextFilter("Title", searchText));
        }
        cachedSearchText = searchText;
        currentPage = 1;
        let res = await source.getMangaList(filters, currentPage);
        list = res.manga;
        hasMore = res.hasMore;
    }
    
    window.onscroll = getMore
    async function getMore() {
        if (window.innerHeight + window.scrollY < document.body.scrollHeight * 0.9  || gettingMore || !hasMore) return;
        gettingMore = true;
        let res = await source.getMangaList(filters, ++currentPage);
        list = [...list, ...res.manga];
        hasMore = res.hasMore;
        gettingMore = false;
    }
</script>

{#if mounted}
    <SearchBar placeholder="Search {source.name}" on:submit={updateMangaList} bind:value={searchText} bind:filters={filters} listings={listings}/>
    {#if cachedSearchText && cachedSearchText.length > 0}
        <div class="heading">
            <div class="heading-title">Results for '{cachedSearchText}'</div>
            <div class="heading-count">{list.length}</div>
        </div>
    {/if}
    <div class="results">
        {#each list as manga}
            <div class="result">
                {#await source.modifyImageRequest(new Request(`${manifest.proxy.url}/${manga.cover}` || "")).then(req => fetch(req)).then(res => res.blob()).then(blob => URL.createObjectURL(blob)) then url}
                    <ListingCard 
                        title={manga.title || ""}
                        subtitle={manga.author || ""}
                        cover={url}
                        href={`/${medium}/browse/${platform}/${sourceId}/id/${encodeURIComponent(manga.id)}/info`}
                    />
                {/await}
            </div>
        {:else}
            <h1>No results.</h1>
        {/each}
        {#each new Array(12 - list.length % 12) as _}
            <div class="result"></div>
        {/each}
    </div>
{:else}
    <LoadingBar />
{/if}

<style lang="scss">
    @use "../../../../../styles/global.scss" as *;
    .results {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        gap: 2rem;
        margin-top: 2rem;
    }
    .result {
        width: 10rem;
        height: 15rem;
    }
    .heading {
        display: flex;
        justify-content: space-between;
        margin-top: 2rem;
        align-items: center;
        font-size: 2rem;
        font-weight: bolder;
        &-count {
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
        }
    }
    @media only screen and (max-width: 800px) {
        .result {
            width: unset;
            height: unset;
            aspect-ratio: 2 / 3;
            flex: 1 0 21%;
        }
    }
    @media only screen and (max-width: 480px) {
        .result {
            flex-basis: 34%;
        }
    }
</style>