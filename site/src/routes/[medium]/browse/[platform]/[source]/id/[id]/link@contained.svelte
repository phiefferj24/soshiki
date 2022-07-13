<script lang="ts">
    import ListingRow from "$lib/listing/ListingRow.svelte";
    import manifest from "$lib/manifest";
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import SearchBar from "$lib/search/SearchBar.svelte";
    import * as Sources from "$lib/sources"
    import type * as MangaSource from "soshiki-packages/manga/mangaSource";
    import Cookie from "js-cookie";

    let source: MangaSource.MangaSource;
    let mounted = false;
    let results: any[] = [];
    let info: MangaSource.Manga
    async function init() {
        let medium = $page.params.medium;
        let sourceId = $page.params.source;
        let platform = $page.params.platform;
        source = Sources.sources[medium][platform].find(s => s.id === sourceId) as MangaSource.MangaSource;
        info = await source.getMangaDetails($page.params.id);
        searchText = info.title;
        cachedSearchText = searchText;
        await getResults();
        mounted = true;
    }
    onMount(init);
    let cachedSearchText = "";
    let searchText = "";
    async function getResults() {
        cachedSearchText = searchText;
        results = await fetch(`${manifest.api.url}/info/${$page.params.medium}/search/${encodeURIComponent(searchText)}`).then(res => res.json());
    }
    async function link(e: Event) {
        e.preventDefault();
        let el = e.target as HTMLElement;
        let id: string;
        while (!id && el) {
            id = el.getAttribute("data-id");
            el = el.parentElement;
        }
        if(id) {
            await fetch(`${manifest.api.url}/link/${$page.params.medium}/${$page.params.platform}/${$page.params.source}/${$page.params.id}?id=${id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${Cookie.get("access")}`
                }
            });
            await goto("./info");
        } else {
            console.error("No id found");
        }
    }
</script>


{#if mounted}
    <SearchBar bind:value={searchText} on:submit={getResults}/>
    <h2>Search results for '{cachedSearchText}' - {results.length}
    </h2>
    {#if results.length > 0}
        <div class="results">
            {#each results as result}
                <div class="result" data-id={result.id}>
                    <ListingRow
                        title={result.info.title || ""}
                        subtitle={result.info.author || ""}
                        cover={result.info.cover || ""}
                        href={``}
                        on:click={async (e) => await link(e)}
                    />
                </div>
            {/each}
        </div>
    {/if}
{/if}
<style lang="scss">
    @use "../../../../../../../styles/global.scss" as *;
    .results {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        border: 3px solid $accent-background-color-light;
        border-radius: 0.5rem;
        @media (prefers-color-scheme: dark) {
            border: 3px solid $accent-background-color-dark;
        }
    }
    .result {
        width: 100%;
        height: 5rem;
        &:not(:last-child) {
            border-bottom: 3px solid $accent-background-color-light;
            @media (prefers-color-scheme: dark) {
                border-bottom: 3px solid $accent-background-color-dark;
            }
        }
    }
</style>