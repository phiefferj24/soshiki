<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import manifest from "$lib/manifest";
    import ListingCard from "$lib/listing/ListingCard.svelte";
    import SearchBar from "$lib/search/SearchBar.svelte";
    let query = $page.params.query;
    let savedQuery = query;
    $: savedQuery = $page.params.query, updateResults();
    let results: any;
    function updateResults() {
        results = fetch(`${manifest.api.url}/info/manga/search/${query}`)
            .then(res => res.json());
    }
    async function submit() {
        await goto(`/manga/search/${query}`);
    }
</script>

<svelte:head>
    <title>{savedQuery} - Soshiki</title>
</svelte:head>

<SearchBar bind:value={query} on:submit={submit}/>
{#if results}
    {#await results then results} 
        <div class="heading">
            <div class="heading-title">Results for '{savedQuery}'</div>
            <div class="heading-count">{results.length}</div>
        </div>
    {/await}
{/if}
<div class="results">
    {#if results}
        {#await results then results} 
            {#each results as result}
                <div class="result">
                    <ListingCard 
                        cover={result.info.cover} 
                        title={result.info.title} 
                        subtitle={result.info.author} 
                        href={`/manga/${result.id}/info`}
                    />
                </div>
            {/each}
            {#each new Array(12 - results.length % 12) as _}
                <div class="result"></div>
            {/each}
        {/await}
    {/if}
</div>

<style lang='scss'>
    @use "../../../styles/global.scss" as *;
    .results {
        display: flex;
        flex-wrap: wrap;
        justify-content: left;
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
        align-items: center;
        font-size: 2rem;
        margin-top: 2rem;
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