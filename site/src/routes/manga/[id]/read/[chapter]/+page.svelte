<script lang="ts">
    import { page } from "$app/stores"
    import { onMount } from "svelte"
    import type * as MangaSource from "soshiki-packages/manga/mangaSource";
    import MultiSourceManga from "$lib/viewers/MultiSourceManga.svelte";
    import * as Sources from '$lib/sources'
    import LoadingBar from "$lib/LoadingBar.svelte";

    let fullscreen = $page.url.searchParams.get("fullscreen") === "true";
    let chapters: MangaSource.MangaChapter[];
    let sources: {[platform: string]: {[sourceId: string]: MangaSource.MangaSource}} = {};
    let info = $page.data.info;
    let mounted = false;
    async function init() {
        let ids = info.source_ids;
        let reqs: Promise<MangaSource.MangaChapter[]>[] = [];
        for (let platform of Object.keys(info.source_ids)) {
            if (!Sources.sources.manga[platform]) continue;
            for (let source of Sources.sources.manga[platform]) {
                if (ids[platform][source.id]) {
                    reqs.push(source.getMangaChapters(decodeURIComponent(ids[platform][source.id].id)).then(res => {
                        res["sourceName"] = source.name;
                        res["sourceId"] = source.id;
                        res["platform"] = platform;
                        res["mangaId"] = ids[platform][source.id].id;
                        return res;
                    }));
                }
            }
        }
        chapters = await Promise.all(reqs).then(double => {
            let reduced: MangaSource.MangaChapter[] = [];
            for (let single of double) {
                for (let chap of single) {
                    if (reduced.findIndex(c => chap.chapter === c.chapter) === -1) {
                        chap["sourceName"] = single["sourceName"];
                        chap["sourceId"] = single["sourceId"];
                        chap["platform"] = single["platform"];
                        chap["mangaId"] = single["mangaId"];
                        if (!sources[single["platform"]]) sources[single["platform"]] = {};
                        if (!sources[single["platform"]][single["sourceId"]]) sources[single["platform"]][single["sourceId"]] = Sources.sources.manga[single["platform"]].find(s => s.id === single["sourceId"]);
                        reduced.push(chap);
                    }
                }
            }
            return reduced;
        }).then(chapters => chapters.filter((chapter, index) => chapters.findIndex(c => chapter.chapter === c.chapter) === index));
        mounted = true;
    }
    onMount(init);
</script>

{#if mounted}
    <div class:container={!fullscreen} class:fullscreen={fullscreen}>
        <MultiSourceManga chapters={chapters} sources={sources} bind:fullscreen/>
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