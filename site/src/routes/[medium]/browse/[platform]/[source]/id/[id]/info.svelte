<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from 'svelte';
    import manifest from "$lib/manifest";
    import * as Sources from "$lib/sources"
    import type * as MangaSource from "soshiki-packages/manga/mangaSource";
    import LoadingBar from "$lib/LoadingBar.svelte";
    import List from "$lib/List.svelte";
    import { DateTime } from "luxon";
    let medium = $page.params.medium;
    let sourceId = $page.params.source;
    let platform = $page.params.platform;
    let source = Sources.sources[medium][platform].find(s => s.id === sourceId) as MangaSource.MangaSource;
    let mounted = false;
    let info: MangaSource.Manga;
    let chapters: MangaSource.MangaChapter[];
    let link: string | null;
    async function init() {
        info = await source.getMangaDetails($page.params.id);
        chapters = await source.getMangaChapters($page.params.id);
        await updateLink();
        mounted = true;
    }
    onMount(init);
    let headerTextHeight = 0;
    async function updateLink() {
        let res = await fetch(`${manifest.api.url}/link/${medium}/${platform}/${sourceId}/${$page.params.id}`);
        let json = await res.json();
        if (!json || !json.id || json.id.length === 0) {
            link = null;
        } else {
            link = json.id;
        }
    }
    page.subscribe(async () => await updateLink());
</script>

<svelte:head>
    {#if mounted}
        <title>{info.title} - Soshiki</title> 
    {/if}
</svelte:head>

{#if mounted}
    <div class="info-header" style:--banner="url({manifest.proxy.url}/{info.cover || ""})">
        <div class="info-header-gradient"></div>
    </div>
    <div class="container" style:--height="{headerTextHeight}px">
        <div class="info-header-content">
            <div class="info-header-cover" style:--cover="url({manifest.proxy.url}/{info.cover || ""})">
            </div>
            <div class="info-header-titles" bind:clientHeight={headerTextHeight}>
                <span class="info-header-subtitle">{source.name} - {platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                <span class="info-header-title">{info.title || ""}</span>
                <span class="info-header-subtitle">{info.author || ""}</span>
                <div class="info-header-statuses">
                    <div class="info-header-status">
                        <div class="info-header-status-chip" style:background-color={link ? "green" : "red"}></div>
                        <a href={link ? `/${medium}/${link}/info` : "./link"} class="info-header-status">{link ? "LINKED" : "UNLINKED"}</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="info-body-content">
            <div class="info-body-content-genres">
                {#if info.tags}
                    {#each info.tags as genre}
                        <span class="info-body-content-genre">{genre}</span>
                    {/each}
                {/if}
            </div>
            <span class="info-body-content-description">{ info.description || "" }</span>
        </div>
        <div class="info-chapters">
            <List title="Chapters" subtitle={`${chapters.length}`}> 
                {#each chapters as chapter}
                    <a class="chapter-list-item" href="./read/{chapter.id}">
                        <span class="chapter-list-item-title">{(chapter.volume !== null && typeof chapter.volume !== "undefined") ? `Volume ${chapter.volume} ` : ""}Chapter {chapter.chapter} {chapter.title ? `- ${chapter.title}` : ""}</span>
                        <span class="chapter-list-item-subtitle">{chapter.scanlator ? `${chapter.scanlator} ${chapter.date ? "- " : ""}` : ""}{chapter.date ? `Released ${DateTime.fromJSDate(chapter.date).toRelative()}` : ""}</span>
                    </a>
                {/each}
            </List>
        </div>
    </div>
{:else}
    <LoadingBar />
{/if}

<style lang="scss">
    @use "../../../../../../../styles/global.scss" as *;
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
    }
    .info-body-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin: 1.5rem 0;
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
        }
    }
    .container {
        position: relative;
        transform: translateY(calc(var(--height) - 15rem));
        padding: 1rem 2rem 2rem 2rem;
        width: min(50rem, 100%);
        margin: 0 auto;
    }
</style>