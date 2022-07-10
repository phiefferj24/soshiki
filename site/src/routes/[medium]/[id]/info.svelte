<script lang="ts">
    import { page } from "$app/stores";
    import manifest from "$lib/manifest";
    let medium = $page.params.medium;
    let id = $page.params.id;
    let result = fetch(`${manifest.api.url}/${medium}/${id}`)
        .then(res => res.json())
        .then(json => json.tracker_ids.mal)
</script>

<svelte:head>
    {#await result then result}
        <title>{result.title} - Soshiki</title> 
    {/await}
</svelte:head>

{#await result then result}
    <p>{result.title} by {result.studios}</p>
    <p>{result.description}</p>
{/await}