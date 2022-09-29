<script lang="ts">
	import Container from '$lib/Container.svelte';
    import { goto } from '$app/navigation';
    import SearchBar from '$lib/search/SearchBar.svelte';
    let query = '';
    async function submit() {
        await goto(`/manga/search/${query}`)
    }
</script>

<Container>
    <SearchBar bind:value={query} on:submit={submit}/>
    <h2>Currently searching through Soshiki's database.</h2>
    <h5>To search within a specific source, select that source in the <a href='/browse' class='hyperlink'>browse</a> tab.</h5>
</Container>
