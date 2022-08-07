<script lang="ts">
    import { mangaSourceClasses, MangaSourceType, parseSourceList, type ExternalMangaSource } from 'soshiki-packages/manga/mangaSource';
    import { page } from '$app/stores'
    import { onMount } from 'svelte';
    import List from '$lib/List.svelte';
    import * as Sources from '$lib/sources';
    import type { SourceType } from 'soshiki-packages/source';
    import LoadingBar from '$lib/LoadingBar.svelte';
    import type { Manga } from 'soshiki-packages/manga/mangaSource'
    import SearchBar from '$lib/search/SearchBar.svelte';
    import manifest from '$lib/manifest';
    import ListingRow from '$lib/listing/ListingRow.svelte';
    import Cookie from 'js-cookie';

    let fileInput: HTMLInputElement;

    let overlay = false;
    let overlay2 = false;
    let installSourcesPopup = false;
    let linkMangaPopup = false;
    let sourceIdList: string[];
    let externalSources: ExternalMangaSource[] = [];
    let soshikiJson = JSON.parse(localStorage.getItem("soshiki") || "{}");
    let installedSourceIdList: string[] = soshikiJson.installedMangaSources?.[$page.params.platform] ?? [];
    let doneInstallingResolver: () => void;
    let doneInstalling = new Promise<void>(res => doneInstallingResolver = res);
    let doneLinkingResolver: () => void;
    let doneLinking = new Promise<void>(res => doneLinkingResolver = res);
    let unlinkedManga: {manga: Manga, sourceId: string}[];
    let linkedManga: {id: string, manga: Manga, sourceId: string}[] = [];

    let files: FileList;
    $: file = files?.[0];

    let completed: Promise<void>;

    async function installSourcesCallback(sourceIds: string[]): Promise<string[]> {
        overlay = true;
        installSourcesPopup = true;
        sourceIdList = sourceIds.filter(id => !installedSourceIdList.includes(id));
        if (sourceIdList.length === 0) doneInstallingResolver();
        return await doneInstalling.then(() => {
            overlay = false;
            installSourcesPopup = false;
            return installedSourceIdList;
        });
    }

    async function installSource(source: ExternalMangaSource) {
        await Sources.installSource("manga", $page.params.platform as SourceType, source);
        sourceIdList = sourceIdList.filter(s => s !== source.id);
        installedSourceIdList.push(source.id);
    }

    async function linkMangaCallback(manga: {manga: Manga, sourceId: string}[]): Promise<{id: string, manga: Manga, sourceId: string}[]> {
        for (let i = 0; i < manga.length; i++) {
            let item = manga[i];
            let res = await fetch(`${manifest.api.url}/link/manga/${$page.params.platform}/${item.sourceId}/${encodeURIComponent(item.manga.id)}`);
            let json = await res.json();
            if (json && json.id && json.id.length >= 0) {
                linkedManga.push({...manga.splice(i, 1)[0], id: json.id});
                i--;
            }
        }
        overlay = true;
        linkMangaPopup = true;
        unlinkedManga = manga;
        if (unlinkedManga.length === 0) doneLinkingResolver();
        return await doneLinking.then(() => {
            overlay = false;
            linkMangaPopup = false;
            return linkedManga;
        });
    }

    let linkingPopup = false;
    let currentlyLinking: {manga: Manga, sourceId: string};
    let searchText = "";
    let cachedSearchText = "";
    let results: any[] = [];
    $: prettySearchText = `Search Results for ${cachedSearchText}`;
    $: resultsLength = results.length.toString();
    async function linkManga(manga: {manga: Manga, sourceId: string}) {
        linkingPopup = true;
        overlay2 = true;
        linkMangaPopup = false;
        currentlyLinking = manga;
        searchText = manga.manga.title ?? "";
        updateSearch();
    }

    async function updateSearch() {
        cachedSearchText = searchText;
        results = await fetch(`${manifest.api.url}/info/manga/search/${encodeURIComponent(searchText)}`).then(res => res.json());
    }

    async function linkMangaEvent(e: Event, id: string) {
        if (typeof currentlyLinking === 'undefined') return;
        linkingPopup = false;
        overlay2 = false;
        linkMangaPopup = true;
        linkedManga.push({...currentlyLinking, id});
        unlinkedManga = unlinkedManga.filter(obj => obj !== currentlyLinking);
        e.preventDefault();
        await fetch(`${manifest.api.url}/link/manga/${$page.params.platform}/${currentlyLinking.sourceId}/${encodeURIComponent(currentlyLinking.manga.id)}/${id}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${Cookie.get("access")}`
            }
        });
        currentlyLinking = undefined;
    }

    let mounted = false;
    async function init() {
        let fullExternalSources = await fetch("/source-lists").then(res => res.json());
        let sourceLists = fullExternalSources.manga[$page.params.platform] ?? fullExternalSources.anime[$page.params.platform] ?? fullExternalSources.novel[$page.params.platform];
        for (let sourceList of sourceLists) {
            externalSources = [...externalSources, ...(await parseSourceList($page.params.platform as MangaSourceType, sourceList))];
        }
        mounted = true;
    }
    onMount(init);
</script>

{#if mounted}
    {#if completed}
        {#await completed}
            <LoadingBar />
        {/await}
    {/if}
<input type="file" bind:files class="file-input" style="display: none;" bind:this={fileInput}>
<div class="overlay" class:overlay-hidden={!overlay}></div>
<div class="overlay-2" class:overlay-hidden={!overlay2}></div>
<div class="container">
    <div class="file-button" on:click={() => {fileInput.click()}}>
        <div class="file-button-row">
            <span class="file-button-title">Upload File...</span>
            <span class="file-button-subtitle">{file?.name ?? ""}</span>
        </div>
        {#if file}
            <span class="file-button-button" on:click|stopPropagation={() => {
                completed = file.arrayBuffer().then(async buffer => await mangaSourceClasses[$page.params.platform].importBackup?.(buffer, installSourcesCallback, linkMangaCallback).then(() => files = undefined));
            }}>Import</span>
        {/if}
    </div>
</div>
<div class="container popup-container">
    {#if installSourcesPopup && sourceIdList}
        <List title="Install Missing Sources (Optional)" exiting={true} on:click={() => {
            doneInstallingResolver();
            installSourcesPopup = false;
        }}>
            <div class="popup-list">
                {#each sourceIdList as sourceId}
                    {@const source = externalSources.find(src => src.id === sourceId)}
                    {#if source}
                        <div class="popup-item">
                            <div class="popup-item-column">
                                <img class="popup-item-image" src={source.image} alt={source.name}>
                                <span class="popup-item-title">{source.name}</span>
                                <span class="popup-item-subtitle">v{source.version}</span>
                            </div>
                            <span class="popup-item-button" on:click={async () => await installSource(source)}>Install</span>
                        </div>
                    {/if}
                {/each}
            </div>
        </List> 
    {/if}
    {#if linkMangaPopup && unlinkedManga}
        <List title="Link Manga" exiting={true} on:click={() => {
            doneLinkingResolver();
            linkMangaPopup = false;
        }}>
            <div class="popup-list">
                {#each unlinkedManga as item}
                    <div class="popup-item">
                        <div class="popup-item-column">
                            {#if item.manga.cover && item.manga.cover.length > 0}
                                <img class="popup-item-image popup-item-image-tall" src={item.manga.cover} alt="">
                            {/if}
                            <div class="popup-item-row">
                                <span class="popup-item-title">{item.manga.title ?? ""}</span>
                                <span class="popup-item-subtitle">{item.manga.author ?? ""}</span>
                            </div>
                        </div>
                        <span class="popup-item-button" on:click={async () => await linkManga(item)}>Link</span>
                    </div>
                {/each}
            </div>
        </List>
    {/if}
</div>
<div class="container popup-container popup-container-2">
    {#if linkingPopup && currentlyLinking}
        <SearchBar bind:value={searchText} on:submit={updateSearch} />
        <List bind:title={prettySearchText} bind:subtitle={resultsLength} exiting={true} on:click={() => { linkingPopup = false; linkMangaPopup = true; overlay2 = false; }}>
            <div class="popup-list">
                {#each results as item}
                    <ListingRow href="" cover={item.info.cover} title={item.info.title} subtitle={item.info.author} on:click={e => linkMangaEvent(e, item.id)} />
                {/each}
            </div>
        </List>
    {/if}
</div>
{:else}
    <LoadingBar />
{/if}

<style lang="scss">
    @use "../../../../styles/global.scss" as *;
    .container {
        padding: 2rem;
        width: min(50rem, 100%);
        margin: 0 auto;
    }
    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        width: 100vw;
        height: 100%;
        background-color: mix(#000000, transparent);
        &-hidden {
            display: none;
        }
        &-2 {
            z-index: 3;
        }
    }
    .file-button {
        border-radius: 0.25rem;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
        box-shadow: 0 0 0.5rem $accent-background-color-light;
        background-color: $accent-background-color-light;
        @media (prefers-color-scheme: dark) {
            box-shadow: 0 0 0.5rem $accent-background-color-dark;
            background-color: $accent-background-color-dark;
        }
        &:hover {
            background-color: $hover-color-light;
            @media (prefers-color-scheme: dark) {
                background-color: $hover-color-dark;
            }
        }
        &-title {
            font-weight: 700;
        }
        &-subtitle {
            font-weight: 600;
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
        }
        &-row {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 1rem;
            padding: 0.25rem 0.5rem;
        }
        &-button {
            font-size: 1rem;
            font-weight: bold;
            color: $accent-text-color-light;
            border-radius: 0.5rem;
            padding: 0.25rem 0.5rem;
            user-select: none;
            cursor: pointer;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
            &:hover {
                background-color: $accent-background-color-light;
                @media (prefers-color-scheme: dark) {
                    background-color: $accent-background-color-dark;
                }
            }
        }
    }

    .popup {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        &-container {
            position: relative;
            z-index: 2;
            &-2 {
                z-index: 4;
            }
        }
        &-list {
            max-height: 60vh;
            overflow: scroll;
        }
        &-item {
            padding: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: $background-color-light;
            @media (prefers-color-scheme: dark) {
                background-color: $background-color-dark;
            }
            &:hover {
                background-color: $hover-color-light;
                @media (prefers-color-scheme: dark) {
                    background-color: $hover-color-dark;
                }
            }
            &-column {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                gap: 0.5rem;
                flex-shrink: 1;
            }
            &-title {
                font-size: 1.25rem;
                font-weight: bold;
                text-overflow: ellipsis;
                flex-shrink: 1;
            }
            &-subtitle {
                font-size: 1rem;
                font-weight: bold;
                color: $accent-text-color-light;
                @media (prefers-color-scheme: dark) {
                    color: $accent-text-color-dark;
                }
            }
            &-image {
                width: 2rem;
                height: 2rem;
                border-radius: 25%;
                margin-right: 0.5rem;
                &-tall {
                    height: 3rem;
                }
            }
            &-row {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: center;
                gap: 0.25rem;
            }
            &-button {
                font-size: 1rem;
                font-weight: bold;
                color: $accent-text-color-light;
                border-radius: 0.5rem;
                padding: 0.25rem 0.5rem;
                user-select: none;
                cursor: pointer;
                @media (prefers-color-scheme: dark) {
                    color: $accent-text-color-dark;
                }
                &:hover {
                    background-color: $accent-background-color-light;
                    @media (prefers-color-scheme: dark) {
                        background-color: $accent-background-color-dark;
                    }
                }
            }
        }
    }
</style>