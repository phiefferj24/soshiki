<script lang="ts">
    import { page } from "$app/stores";
    import { currentMedium } from "$lib/stores";
    import { goto } from "$app/navigation";
    import manifest from "$lib/manifest";
    import ListingCard from "$lib/listing/ListingCard.svelte";
    import SearchBar from "$lib/search/SearchBar.svelte";
    let query = $page.params.query;
    let savedQuery = query;
    $: savedQuery = $page.params.query, updateResults();
    let results: any;
    function updateResults() {
        results = fetch(`${manifest.api.url}/${$currentMedium}/search/${query}`)
            .then(res => res.json());
    }
    async function submit() {
        await goto(`/${$currentMedium}/search/${query}`);
    }
</script>

<svelte:head>
    <title>{savedQuery} - Soshiki</title>
</svelte:head>

<SearchBar bind:value={query} on:submit={submit}/>
<h2>Search results for '{savedQuery}'
    {#if results}
        {#await results then results} 
            - {results.length}
        {/await}
    {/if}
</h2>
<div class="results">
    {#if results}
        {#await results then results} 
            {#each results as result}
                <div class="result">
                    <ListingCard cover={result.info.cover} title={result.info.title} subtitle={result.info.author} id={result.id} />
                </div>
            {/each}
        {/await}
    {/if}
</div>

<style lang='scss'>
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
</style>