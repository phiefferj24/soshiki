<script lang="ts">
    import { page } from "$app/stores";
    import Cookie from 'js-cookie';
    import manifest from "$lib/manifest";
    import { currentMedium } from "$lib/stores";
    import { onMount } from "svelte";
    import List from "$lib/List.svelte";
    import type { MangaChapter } from "soshiki-packages/manga/mangaSource";
    import { sources } from "$lib/sources";
    import { DateTime } from 'luxon';
    import Dropdown from "$lib/Dropdown.svelte";
    import { TrackerStatus } from "soshiki-types";
    import Stars from "$lib/Stars.svelte";
    let medium = $page.params.medium;
    let id = $page.params.id;
    let info: any;
    let headerTextHeight = 0;
    let headerImageHeight = 0;
    let mounted = false;
    let chaptersGot: Promise<void>;
    let chapters: MangaChapter[] = [];
    let historyGot: Promise<void>;
    let history: {chapter?: number, page?: number, status?: TrackerStatus, rating?: number};
    let library: string[];
    async function init() {
        info = await fetch(`${manifest.api.url}/info/${medium}/${id}`, {
            headers: {
                Authorization: `Bearer ${Cookie.get("access")}`
            }
        }).then(res => res.json());
        chaptersGot = (async () => {
            let ids = info.source_ids;
            let reqs: Promise<MangaChapter[]>[] = [];
            for (let platform of Object.keys(info.source_ids)) {
                if (!sources[medium][platform]) continue;
                for (let source of sources[medium][platform]) {
                    if (ids[platform][source.id]) {
                        reqs.push(source.getMangaChapters(decodeURIComponent(ids[platform][source.id].id)).then(res => {
                            res["sourceName"] = source.name;
                            res["sourceId"] = source.id;
                            res["platform"] = platform;
                            return res;
                        }));
                    }
                }
            }
            let double = await Promise.all(reqs);
            let reduced: MangaChapter[] = [];
            for (let single of double) {
                for (let chap of single) {
                    if (reduced.findIndex(c => chap.chapter === c.chapter) === -1) {
                        chap["sourceName"] = single["sourceName"];
                        chap["sourceId"] = single["sourceId"];
                        chap["platform"] = single["platform"];
                        chap["completed"] = false;
                        reduced.push(chap);
                    }
                }
            }
            chapters = reduced.filter((chapter, index) => reduced.findIndex(c => chapter.chapter === c.chapter) === index);
        })();
        historyGot = (async () => {
            await chaptersGot;
            let res = await fetch(`${manifest.api.url}/history/${$page.params.medium}/${$page.params.id}`, {
                headers: { Authorization: `Bearer ${Cookie.get("access")}` }
            });
            let json = await res.json();
            chapters.forEach(chapter => {
                if (typeof json["chapter"] === "number") {
                    if (chapter.chapter < json["chapter"]) chapter["completed"] = true;
                    else if (chapter.chapter === json["chapter"] && typeof json["page"] === "number") chapter["pageOn"] = json["page"];
                }
            });
            chapters = chapters;
            history =  { chapter: json["chapter"], page: json["page"], status: json["status"] as TrackerStatus, rating: json["rating"] };
        })();

        fetch(`${manifest.api.url}/library/${$page.params.medium}`, {
            headers: { Authorization: `Bearer ${Cookie.get("access")}` }
        }).then(res => res.json()).then(json => library = json);
        mounted = true;
    }
    onMount(init);

    async function setStatus(status: number) {
        await fetch(`${manifest.api.url}/history/${$page.params.medium}/${$page.params.id}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${Cookie.get("access")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: status,
                trackers: ["mal", "anilist"]
            })
        });
        history = { ...history, status: status };
        statusDropped = false;
    }
    let statusDropped = false;

    async function setScore(score: number) {
        await fetch(`${manifest.api.url}/history/manga/${$page.params.id}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${Cookie.get("access")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                rating: score,
                trackers: ["mal", "anilist"]
            })
        });
        history = { ...history, rating: score };
    }

    async function setLibrary(state: boolean) {
        await fetch(`${manifest.api.url}/library/${$page.params.medium}/${$page.params.id}`, {
            method: state ? "PUT" : "DELETE",
            headers: { Authorization: `Bearer ${Cookie.get("access")}` }
        });
        if (state) library.push($page.params.id);
        else library.splice(library.indexOf($page.params.id), 1);
        library = library;
    }
</script>

<svelte:head>
    {#if mounted}
        <title>{info.info.title} - Soshiki</title> 
    {/if}
</svelte:head>

{#if mounted}
    <div class="info-header" style:--banner="url({info.info.anilist?.bannerImage || ""})">
        <div class="info-header-gradient"></div>
    </div>
    <div class="container" style:--height="{window.screen.width <= 640 ? headerImageHeight / 4 : headerTextHeight}px">
        <div class="info-header-content">
            <div class="info-header-cover" style:--cover="url({
                info.info.anilist?.coverImage?.large || 
                info.info.anilist?.coverImage?.medium ||
                info.info.anilist?.coverImage?.small ||
                info.info.anilist?.coverImage?.color ||
                info.info.mal?.main_picture?.large ||
                info.info.mal?.main_picture?.medium ||
                info.info.cover ||
                ""
                })" bind:clientHeight={headerImageHeight}>
            </div>
            <div class="info-header-titles" bind:clientHeight={headerTextHeight}>
                <span class="info-header-title">{
                    info.info.anilist?.title?.english ||
                    info.info.mal?.alternative_titles?.en ||
                    info.info.title ||
                    ""
                }</span>
                <span class="info-header-subtitle">{
                    info.info.anilist?.title?.romaji ||
                    info.info.anilist?.title?.native ||
                    info.info.mal?.alternative_titles?.ja ||
                    info.info.alternative_titles?.[0] ||
                    ""
                }</span>
                <div class="info-header-statuses">
                    <div class="info-header-status">
                        <div class="info-header-status-chip" style:background-color={info.info.mal ? "green" : "red"}></div>
                        <a href={info.info.mal ? `https://myanimelist.net/${medium === "anime" ? "anime" : "manga"}/${info.info.mal.id}` : ""} class="info-header-status">MAL</a>
                    </div>
                    <div class="info-header-status">
                        <div class="info-header-status-chip" style:background-color={info.info.anilist ? "green" : "red"}></div>
                        <a href={info.info.anilist ? `https://anilist.co/${medium === "anime" ? "anime" : "manga"}/${info.info.anilist.id}`: ""} class="info-header-status">ANILIST</a>
                    </div>
                    {#if library}
                        {@const includes = library.includes($page.params.id)}
                        <div class="info-header-library" on:click={() => setLibrary(!includes)}>
                            <i class="f7-icons info-header-library-glyph">{includes ? "bookmark_fill" : "bookmark"}</i>
                            <span class="info-header-library-span">{includes ? "REMOVE FROM LIBRARY" : "ADD TO LIBRARY"}</span>
                        </div>
                    {/if}
                </div>
                {#if history}
                    <div class="info-header-row">
                        <Dropdown bind:dropped={statusDropped} label={"Status"} title={Object.keys(TrackerStatus).filter(v => isNaN(Number(v)))[history.status ?? 0].toString().charAt(0).toUpperCase() + Object.keys(TrackerStatus).filter(v => isNaN(Number(v)))[history.status ?? 0].toString().substring(1)}>
                            {#each Object.keys(TrackerStatus).filter(v => isNaN(Number(v))) as status}
                                <span class="info-header-dropdown-span" on:click={() => setStatus(TrackerStatus[status])}>{status.toString().charAt(0).toUpperCase() + status.toString().substring(1)}</span>
                            {/each}
                        </Dropdown>
                        <div class="info-header-rating">
                            <span class="info-header-rating-label">Rating</span>
                            <Stars score={history.rating} onChange={score => setScore(score)} />
                        </div>
                    </div>
                    {#if chapters.length > 0}
                        {@const index = chapters.findIndex(c => c.chapter === history.chapter)}
                        {#if typeof history.chapter === "number" && index !== -1}
                            <a href="./read/{index}?page={history.page ?? 0}" class="info-header-continue">
                                <span class="info-header-continue-title">Continue Reading {typeof chapters[index].volume !== "undefined" ? `Volume ${chapters[index].volume} ` : ""}Chapter {chapters[index].chapter}{chapters[index].title ? ` - ${chapters[index].title}` : ""}</span>
                            </a>
                        {:else}
                            <a href="./read/{chapters.length - 1}" class="info-header-continue">
                                <span class="info-header-continue-title">Begin Reading {typeof chapters[chapters.length - 1].volume !== "undefined" ? `Volume ${chapters[chapters.length - 1].volume} ` : ""}Chapter {chapters[chapters.length - 1].chapter}{chapters[chapters.length - 1].title ? ` - ${chapters[chapters.length - 1].title}` : ""}</span>
                            </a>
                        {/if}
                    {/if}
                {/if}
            </div>
        </div>
        <div class="info-body-content">
            <div class="info-body-content-genres">
                {#if info.info.anilist?.genres}
                    {#each info.info.anilist.genres as genre}
                        <span class="info-body-content-genre">{genre}</span>
                    {/each}
                {:else if info.info.mal?.genres}
                    {#each info.info.mal.genres as genre}
                        <span class="info-body-content-genre">{genre.name}</span>
                    {/each}
                {/if}
            </div>
            <span class="info-body-content-description">{
                @html info.info.anilist?.description?.replace(/<script.*?>.*?<\/script>/g, "") ||
                info.info.mal?.synopsis ||
                ""
            }</span>
        </div>
        <div class="info-chapters">
            <List title="Chapters" subtitle={`${chapters.length}`}> 
                {#each chapters as chapter, index}
                    <a class="chapter-list-item" href="./read/{index}">
                        <span class="chapter-list-item-title" class:chapter-list-item-title-completed={chapter["completed"] === true}>{(chapter.volume !== null && typeof chapter.volume !== "undefined") ? `Volume ${chapter.volume} ` : ""}Chapter {chapter.chapter} {chapter.title ? `- ${chapter.title}` : ""}</span>
                        <span class="chapter-list-item-subtitle">{chapter["sourceName"]} - {chapter["platform"].charAt(0).toUpperCase() + chapter["platform"].substring(1)}{typeof chapter["pageOn"] === "undefined" ? "" : ` - Page ${chapter["pageOn"]}`}</span>
                        <span class="chapter-list-item-subtitle">{chapter.scanlator ? `${chapter.scanlator} ${chapter.date ? "- " : ""}` : ""}{chapter.date ? `Released ${DateTime.fromJSDate(chapter.date).toRelative()}` : ""}</span>
                    </a>
                {/each}
            </List>
        </div>
    </div>
{/if}

<style lang="scss">
    @use "../../../styles/global.scss" as *;
    .info-header {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        height: 15rem;
        background-image: var(--banner);
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        &-titles {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            word-break: break-all;
            hyphens: auto;
        }
        &-title {
            font-size: 2rem;
            font-weight: 800;
            z-index: 1;
        }
        &-subtitle {
            font-size: 1.25rem;
            font-weight: 600;
            z-index: 1;
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
        }
        &-gradient {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 50%;
            background: linear-gradient(to bottom, transparent, $background-color-light);
            @media (prefers-color-scheme: dark) {
                background: linear-gradient(to bottom, transparent, $background-color-dark);
            }
        }
        &-content {
            display: flex;
            align-items: flex-end;
            justify-content: flex-start;
            gap: 2rem;
            @media only screen and (max-width: 640px) {
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
            }
        }
        &-cover {
            width: 10rem;
            height: 15rem;
            flex: 0 0 auto;
            background-image: var(--cover);
            background-position: center;
            background-size: cover;
            background-repeat: no-repeat;
            border-radius: 0.5rem;
            box-shadow: 0 0 0.5rem 0.1rem $background-color-light;
            @media (prefers-color-scheme: dark) {
                box-shadow: 0 0 0.5rem 0.1rem $background-color-dark;
            }
        }
        &-statuses {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 2rem;
        }
        &-status {
            display: flex;
            gap: 0.25rem;
            align-items: center;
            font-size: 0.75rem;
            font-weight: bold;
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
            &-chip {
                width: 0.75rem;
                height: 0.75rem;
                border-radius: 50%;
            }
        }
        &-library {
            display: flex;
            gap: 0.25rem;
            align-items: center;
            font-size: 0.75rem;
            font-weight: bold;
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
            cursor: pointer;
            & * {
                pointer-events: none;
            }
            &-glyph {
                font-size: 1rem;
            }
        }
        &-continue {
            border-radius: 0.5rem;
            border: 2px solid $accent-background-color-light;
            width: 100%;
            padding: 0.25rem 0.5rem;
            background-color: $hover-color-light;
            @media (prefers-color-scheme: dark) {
                border-color: $accent-background-color-dark;
                background-color: $hover-color-dark;
            }
            &:hover {
                background-color: $accent-background-color-light;
                @media (prefers-color-scheme: dark) {
                    background-color: $accent-background-color-dark;
                }
            }
            &-title {
                font-weight: bold;
            }
        }
        &-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            @media only screen and (max-width: 640px) {
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
            }
        }
        &-dropdown {
            &-span {
                cursor: pointer;
                font-weight: 600;
                padding: 0.25rem 0.5rem;
                border-radius: 0.5rem;
                &:hover {
                    background-color: $hover-color-light;
                    @media (prefers-color-scheme: dark) {
                        background-color: $hover-color-dark;
                    }
                }
            }
        }
        &-rating {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            &-label {
                font-weight: 600;
                color: $accent-text-color-light;
                @media (prefers-color-scheme: dark) {
                    color: $accent-text-color-dark;
                }
            }
        }
    }
    .info-body-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 1.5rem;
        &-description {
            font-size: 1rem;
            font-weight: 600;
            line-height: 1.4;
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
        }
        &-genres {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            overflow: scroll;
            gap: 0.5rem;
        }
        &-genre {
            font-size: 1rem;
            font-weight: bold;
            background-color: $accent-background-color-light;
            color: $accent-text-color-light;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            @media (prefers-color-scheme: dark) {
                background-color: $accent-background-color-dark;
                color: $accent-text-color-dark;
            }
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
    .container {
        position: relative;
        transform: translateY(calc(var(--height) - 15rem));
        padding: 1rem 2rem 2rem 2rem;
        width: min(50rem, 100%);
        margin: 0 auto;
    }
    .chapter-list-item {
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        font-weight: bold;
        gap: 0.25rem;
        cursor: pointer;
        &:hover {
            background-color: $hover-color-light;
            @media (prefers-color-scheme: dark) {
                background-color: $hover-color-dark;
            }
        }
        &-title {
            font-size: 1rem;
            overflow: hidden;
            &-completed {
                color: $accent-text-color-light;
                @media (prefers-color-scheme: dark) {
                    color: $accent-text-color-dark;
                }
            }
        }
        &-subtitle {
            font-size: 0.8rem;
            overflow: hidden;
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
        }
    }
    .info-chapters {
        margin-top: 2rem;
    }
</style>