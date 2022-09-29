<script lang="ts">
    import { page } from "$app/stores";
    import * as Sources from "$lib/sources";
    import type * as MangaSource from "soshiki-packages/manga/mangaSource";
    import type * as Source from "soshiki-packages/source";
    import { onMount } from "svelte";
    import SearchBar from "$lib/search/SearchBar.svelte";
    import ListingCard from "$lib/listing/ListingCard.svelte";
    import LoadingBar from "$lib/LoadingBar.svelte";
    import { goto } from "$app/navigation";
    import { proxy } from "$lib/stores";
    import Container from '$lib/Container.svelte';
    let sourceId = $page.params.source;
    let platform = $page.params.platform;
    let source = Sources.sources.manga[platform].find(s => s.id === sourceId) as MangaSource.MangaSource;
    let mounted = false;
    let currentPage = 1;
    let gettingMore = false;
    let hasMore = true;
    let list: MangaSource.Manga[];
    let listings: Source.Listing[] = [];
    let listing: Source.Listing;
    async function init() {
        listings = await source.getListings();
        listing = listings.find(listing => listing.id === $page.params.listing);
        console.log(listing)
        let res = await source.getMangaListing(listing, currentPage);
        list = res.manga;
        hasMore = res.hasMore;
        mounted = true;
    }
    onMount(init);
    let searchText: string;
    async function updateMangaList() {
        if (searchText && searchText.length > 0) {
            await goto(`/manga/browse/${platform}/${sourceId}?q=${encodeURIComponent(searchText)}`);
        }
    }
    
    window.onscroll = getMore
    async function getMore() {
        if (window.innerHeight + window.scrollY < document.body.scrollHeight * 0.9 || gettingMore || !hasMore) return;
        gettingMore = true;
        let res = await source.getMangaListing(listing, ++currentPage);
        list = [...list, ...res.manga];
        hasMore = res.hasMore;
        gettingMore = false;
    }
</script>

{#if mounted}
    <Container>
        <SearchBar placeholder="Search {source.name}" on:submit={updateMangaList} bind:value={searchText} listings={listings}/>
        <div class="heading">
            <a href="/manga/browse/{$page.params.platform}/{$page.params.source}"><i class="f7-icons heading-glyph">chevron_left</i></a>
            <span class="heading-title">{listing.name}</span>
        </div>
        <div class="results">
            {#each list as manga}
                <div class="result">
                    <ListingCard 
                        title={manga.title || ""}
                        subtitle={manga.author || ""}
                        cover={`${$proxy}/${manga.cover}` || ""}
                        href={`/manga/browse/${platform}/${sourceId}/id/${encodeURIComponent(manga.id)}/info`}
                    />
                </div>
            {:else}
                <h1>No results.</h1>
            {/each}
            {#each new Array(12 - list.length % 12) as _}
                <div class="result"></div>
            {/each}
        </div>
    </Container>
{:else}
    <LoadingBar />
{/if}

<style lang="scss">
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
        margin-top: 2rem;
        display: flex;
        justify-content: flex-start;
        gap: 0.5rem;
        align-items: center;
        &-glyph {
            font-size: 2rem;
            font-weight: 900;
            cursor: pointer;
        }
        &-title {
            font-size: 2rem;
            font-weight: bolder;
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