<script lang="ts">
    import { page } from "$app/stores";
    import * as Sources from "$lib/sources";
    import type * as MangaSource from "soshiki-packages/manga/mangaSource";
    import type { Source } from "soshiki-packages/source";
    import { onMount } from "svelte";
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
</script>

{#if mounted}
    {#each list.manga as manga}
        <p>{manga.title}</p>
    {:else}
        <p>Nothing</p>
    {/each}
{/if}