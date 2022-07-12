<script lang=ts>
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import * as MangaSource from "soshiki-packages/manga/mangaSource"
    import * as Sources from "$lib/sources"
    import type { Medium } from "soshiki-types";
    import type { SourceType } from "soshiki-packages/source";
import { goto } from "$app/navigation";
    let installedSources: {[key: string]: any} = {};
    let installedSourcesState: {[key: string]: boolean} = {};
    let externalSources: {[key: string]: any} = {};
    let externalSourcesState: {[key: string]: boolean} = {};
    let mounted = false;
    onMount(async () => {
        let soshikiJson = JSON.parse(localStorage.getItem("soshiki") || "{}");
        let installedMangaSources = soshikiJson.installedMangaSources || [];
        let installedAnimeSources = soshikiJson.installedAnimeSources || [];
        let installedNovelSources = soshikiJson.installedNovelSources || [];
        switch($page.params.medium) {
            case "manga":
                installedSources = installedMangaSources;
                break;
            case "anime":
                installedSources = installedAnimeSources;
                break;
            case "novel":
                installedSources = installedNovelSources;
                break;
        }
        for(let platform of Object.keys(installedSources)) {
            installedSourcesState[platform] = false;
        }
        let fullExternalSources = await fetch("/source-lists").then(res => res.json());
        let externalAnimeSources = fullExternalSources.anime;
        let externalMangaSources = fullExternalSources.manga;
        let externalNovelSources = fullExternalSources.novel;
        let tempExternalSources = [];
        switch($page.params.medium) {
            case "manga":
                tempExternalSources = externalMangaSources;
                break;
            case "anime":
                tempExternalSources = externalAnimeSources;
                break;
            case "novel":
                tempExternalSources = externalNovelSources;
                break;
        }
        for(let platform of Object.keys(tempExternalSources)) {
            let lists = tempExternalSources[platform];
            externalSources[platform] = [];
            switch($page.params.medium) {
                case "manga":
                    for(let list of lists) {
                        let fetched = await fetch(list);
                        let json = await fetched.json();
                        let parsed = MangaSource.parseSourceList(platform as MangaSource.MangaSourceType, json, list);
                        parsed = parsed.filter(source => !installedSources[platform] || installedSources[platform].findIndex(source2 => source2.id === source.id) === -1);
                        externalSources[platform] = [...externalSources[platform], ...parsed];
                    }
                    break;
            }
        }
        for(let platform of Object.keys(externalSources)) {
            externalSourcesState[platform] = false;
        }
        mounted = true;
    })

    async function installSource(platform: string, source: any) {
        await Sources.installSource($page.params.medium as Medium, platform as SourceType, source);
        installedSources[platform] = [...installedSources[platform] || [], source];
        externalSources[platform] = externalSources[platform].filter(s => s.id !== source.id);
    }
    async function removeSource(platform: string, source: any) {
        await Sources.removeSource($page.params.medium as Medium, platform as SourceType, source.id);
        installedSources[platform] = installedSources[platform].filter(s => s.id !== source.id);
        externalSources[platform] = [...externalSources[platform] || [], source];
    }
    async function sourceSelected(event: Event) {
        let target = event.target as HTMLElement;
        let platform = target.dataset.platform;
        let id = target.dataset.id;
        if(platform && id) await goto(`${$page.url.toString()}/${platform}/${id}`);
    }
</script>

{#if mounted}
    <div class="browse">
        <span class="browse-heading">Installed Sources</span>
        <div class="dropdown-list">
            {#each Object.keys(installedSources) || [] as platform}
                <div class="dropdown-list-section">
                    <div class="dropdown-list-section-header" class:dropdown-list-section-header-dropped={installedSourcesState[platform]}>
                        <span class="dropdown-list-section-title">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                        <div class="dropdown-list-section-column">
                            <span class="dropdown-list-section-title">{installedSources[platform].length}</span>
                            <i class="f7-icons dropdown-list-section-glyph" on:click={() => {installedSourcesState[platform] = !installedSourcesState[platform]}}>{installedSourcesState[platform] ? "chevron_up" : "chevron_down"}</i>
                        </div>
                    </div>
                    <div class="dropdown-list-section-content" class:dropdown-list-section-content-hidden={!installedSourcesState[platform]}>
                        {#each installedSources[platform] as source}
                            <div class="dropdown-list-section-content-item" data-platform={platform} data-id={source.id} on:click={(e) => sourceSelected(e)}>
                                <div class="dropdown-list-section-content-item-column">
                                    <img class="dropdown-list-section-content-item-image" src={source.image} alt={source.name}>
                                    <span class="dropdown-list-section-content-item-title">{source.name}</span>
                                    <span class="dropdown-list-section-content-item-subtitle">v{source.version}</span>
                                </div>
                                <span class="dropdown-list-section-content-item-button" on:click={async () => await removeSource(platform, source)}>Remove</span>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
        <span class="browse-heading">Available Sources</span>
        <div class="dropdown-list">
            {#each Object.keys(externalSources) || [] as platform}
                <div class="dropdown-list-section">
                    <div class="dropdown-list-section-header" class:dropdown-list-section-header-dropped={externalSourcesState[platform]}>
                        <span class="dropdown-list-section-title">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                        <div class="dropdown-list-section-column">
                            <span class="dropdown-list-section-title">{externalSources[platform].length}</span>
                            <i class="f7-icons dropdown-list-section-glyph" on:click={() => {externalSourcesState[platform] = !externalSourcesState[platform]}}>{externalSourcesState[platform] ? "chevron_up" : "chevron_down"}</i>
                        </div>
                    </div>
                    <div class="dropdown-list-section-content" class:dropdown-list-section-content-hidden={!externalSourcesState[platform]}>
                        {#each externalSources[platform] as source}
                            <div class="dropdown-list-section-content-item">
                                <div class="dropdown-list-section-content-item-column">
                                    <img class="dropdown-list-section-content-item-image" src={source.image} alt={source.name}>
                                    <span class="dropdown-list-section-content-item-title">{source.name}</span>
                                    <span class="dropdown-list-section-content-item-subtitle">v{source.version}</span>
                                </div>
                                <span class="dropdown-list-section-content-item-button" on:click={async () => await installSource(platform, source)}>Install</span>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    </div>
{/if}

<style lang=scss>
    @use '../../../styles/global.scss' as *;
    .browse {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        &-heading {
            font-size: 1.5rem;
            font-weight: bold;
        }
        &-subheading {
            font-size: 1rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
    }
    .dropdown-list {
        display: flex;
        flex-direction: column;
        &-section {
            border-radius: 0.5rem;
            border: 3px solid $accent-background-color-light;
            @media (prefers-color-scheme: dark) {
                border-color: $accent-background-color-dark;
            }

            &-header {
                display: flex;
                justify-content: space-between;
                background-color: $accent-background-color-light;
                font-size: 1.25rem;
                font-weight: bold;
                padding: 0.5rem;
                border-radius: 0.25rem;
                @media (prefers-color-scheme: dark) {
                    background-color: $accent-background-color-dark;
                }
                &-dropped {
                    border-radius: 0.25rem 0.25rem 0 0;
                }
            }
            &-column {
                        display: flex;
                        align-items: center;
                        justify-content: flex-start;
                        gap: 0.5rem;
                    }
            &-content {
                display: flex;
                flex-direction: column;
                &-hidden {
                    display: none;
                }
                &-item {
                    padding: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    &:not(:last-child) {
                        border-bottom: 3px solid $accent-background-color-light;
                        @media (prefers-color-scheme: dark) {
                            border-bottom-color: $accent-background-color-dark;
                        }
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
                    }
                    &-title {
                        font-size: 1.25rem;
                        font-weight: bold;
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
        }
    }
</style>