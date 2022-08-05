<script lang="ts">
    import { page } from "$app/stores"
    import { goto } from "$app/navigation"
    import { onMount } from "svelte"
    import type * as MangaSource from "soshiki-packages/manga/mangaSource";
    import * as Sources from "$lib/sources"
    import Manga from "$lib/viewers/Manga.svelte";
    import LoadingBar from "$lib/LoadingBar.svelte";

    let fullscreen = $page.url.searchParams.get("fullscreen") === "true";
    let mounted = false;
    let medium = $page.params.medium;
    let sourceId = $page.params.source;
    let platform = $page.params.platform;
    let source = Sources.sources[medium][platform].find(s => s.id === sourceId) as MangaSource.MangaSource;
    async function init() {
        if($page.params.medium === "anime") {
            await goto($page.url.toString().replace(/\/read\/([^/]*)/, "/watch/$1"));
        }
        mounted = true;
    }
    onMount(init);
</script>

{#if mounted}
    <div class:container={!fullscreen} class:fullscreen={fullscreen}>
        <Manga source={source} bind:fullscreen/>
    </div>
{:else}
    <LoadingBar />
{/if}

<style lang="scss">
    .container {
        width: min(100%, 50rem);
        margin: 0 auto;
        padding: 2rem;
    }
</style>