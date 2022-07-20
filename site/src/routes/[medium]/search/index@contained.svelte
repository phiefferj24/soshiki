<script lang="ts">
    import { currentMedium } from '$lib/stores';
    import { goto } from '$app/navigation';
    import SearchBar from '$lib/search/SearchBar.svelte';
    import { type Filter, FilterType } from 'soshiki-packages/source';
    let query = '';
    async function submit() {
        await goto(`/${$currentMedium}/search/${query}`)
    }
</script>
<div class=container>
    <SearchBar bind:value={query} on:submit={submit}/>
    <h2>Currently searching through Soshiki's database.</h2>
    <h5>To search within a specific source, select that source in the <a href='/browse' class='hyperlink'>browse</a> tab.</h5>
</div>

<style lang='scss'>
    .container {
        padding: 2rem;
        width: min(50rem, 100%);
        margin: 0 auto;
    }
</style>