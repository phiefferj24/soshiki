<script lang="ts">
    import { page } from "$app/stores"
    import { goto } from "$app/navigation"
    import { onMount } from "svelte"
    import type * as MangaSource from "soshiki-packages/manga/mangaSource";
    import LoadingBar from "$lib/LoadingBar.svelte";
    import MultiSourceManga from "$lib/viewers/MultiSourceManga.svelte";
    import manifest from "$lib/manifest";
    import Cookie from 'js-cookie';
    import * as Sources from '$lib/sources'

    let fullscreen = $page.url.searchParams.get("fullscreen") === "true";
    let mounted = false;
    let medium = $page.params.medium;
    let id = $page.params.id;
    let chapters: MangaSource.MangaChapter[];
    let sources: {[platform: string]: {[sourceId: string]: MangaSource.MangaSource}} = {};
    async function init() {
        if($page.params.medium === "anime") {
            await goto($page.url.toString().replace(/\/read\/([^/]*)/, "/watch/$1"));
        }
        chapters = await fetch(`${manifest.api.url}/info/${medium}/${id}`, {
            headers: {
                Authorization: `Bearer ${Cookie.get("access")}`
            }
        }).then(res => res.json()).then(info => {
            let ids = info.source_ids;
            let reqs: Promise<MangaSource.MangaChapter[]>[] = [];
            for (let platform of Object.keys(info.source_ids)) {
                if (!Sources.sources[medium][platform]) continue;
                for (let source of Sources.sources[medium][platform]) {
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
            return Promise.all(reqs).then(double => {
                let reduced: MangaSource.MangaChapter[] = [];
                for (let single of double) {
                    for (let chap of single) {
                        if (reduced.findIndex(c => chap.chapter === c.chapter) === -1) {
                            chap["sourceName"] = single["sourceName"];
                            chap["sourceId"] = single["sourceId"];
                            chap["platform"] = single["platform"];
                            chap["mangaId"] = single["mangaId"];
                            if (!sources[single["platform"]]) sources[single["platform"]] = {};
                            if (!sources[single["platform"]][single["sourceId"]]) sources[single["platform"]][single["sourceId"]] = Sources.sources[medium][single["platform"]].find(s => s.id === single["sourceId"]);
                            reduced.push(chap);
                        }
                    }
                }
                return reduced;
            }).then(chapters => chapters.filter((chapter, index) => chapters.findIndex(c => chapter.chapter === c.chapter) === index));
        });
        mounted = true;
    }
    onMount(init);
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