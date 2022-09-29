<script lang=ts>
	import Container from '$lib/Container.svelte';
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import * as MangaSource from "soshiki-packages/manga/mangaSource"
    import * as Sources from "$lib/sources"
    import type { SourceType } from "soshiki-packages/source";
    import { goto } from "$app/navigation";
    import List from "$lib/List.svelte";
    import LoadingBar from "$lib/LoadingBar.svelte";
    let installedSources: {[key: string]: any} = {};
    let externalSources: {[key: string]: any} = {};
    let mounted = false;
    onMount(async () => {
        let soshikiJson = JSON.parse(localStorage.getItem("soshiki") || "{}");
        installedSources = soshikiJson.installedMangaSources || [];
        let fullExternalSources = await fetch("/source-lists").then(res => res.json());
        let tempExternalSources = fullExternalSources.manga;
        for(let platform of Object.keys(tempExternalSources)) {
            let lists = tempExternalSources[platform];
            externalSources[platform] = [];
            for(let list of lists) {
                let parsed = await MangaSource.parseSourceList(platform as MangaSource.MangaSourceType, list);
                parsed = parsed.filter(source => !installedSources[platform] || installedSources[platform].findIndex(source2 => source2.id === source.id) === -1);
                externalSources[platform] = [...externalSources[platform], ...parsed];
            }
        }
        mounted = true;
    })

    async function installSource(platform: string, source: any) {
        await Sources.installSource("manga", platform as SourceType, source);
        installedSources[platform] = [...installedSources[platform] || [], source];
        externalSources[platform] = externalSources[platform].filter(s => s.id !== source.id);
    }
    async function removeSource(platform: string, source: any) {
        await Sources.removeSource("manga", platform as SourceType, source.id);
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
    <Container>
        <div class="browse">
            <span class="browse-heading">Installed Sources</span>
            <div class="list-list">
                {#each Object.keys(installedSources) || [] as platform}
                    {#if installedSources[platform].length > 0}
                        <List title={platform.charAt(0).toUpperCase() + platform.slice(1)} subtitle={installedSources[platform].length} collapsing={true}>
                            {#each installedSources[platform] as source}
                                <div class="list-item" data-platform={platform} data-id={source.id} on:click={(e) => sourceSelected(e)}>
                                    <div class="list-item-column">
                                        <img class="list-item-image" src={source.image} alt={source.name}>
                                        <span class="list-item-title">{source.name}</span>
                                        <span class="list-item-subtitle">v{source.version}</span>
                                    </div>
                                    <span class="list-item-button" on:click={async () => await removeSource(platform, source)}>Remove</span>
                                </div>
                            {/each}
                        </List>
                    {/if}
                {:else}
                    <span class="subtitle">None found.</span>
                {/each}
            </div>
            <span class="browse-heading">Available Sources</span>
            <div class="list-list">
                {#each Object.keys(externalSources) || [] as platform}
                    {#if externalSources[platform].length > 0}
                        <List title={platform.charAt(0).toUpperCase() + platform.slice(1)} subtitle={externalSources[platform].length} collapsing={true}>
                            {#each externalSources[platform] as source}
                                <div class="list-item">
                                    <div class="list-item-column">
                                        <img class="list-item-image" src={source.image} alt={source.name}>
                                        <span class="list-item-title">{source.name}</span>
                                        <span class="list-item-subtitle">v{source.version}</span>
                                    </div>
                                    <span class="list-item-button" on:click={async () => await installSource(platform, source)}>Install</span>
                                </div>
                            {/each}
                        </List>
                    {/if}
                {:else}
                    <span class="subtitle">None found.</span>
                {/each}
            </div>
        </div>
    </Container>
{:else}
    <LoadingBar />
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
    .list {
        &-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        &-item {
            padding: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            & *:not(span.list-item-button) {
                pointer-events: none;
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
    .subtitle {
        margin: 0.5rem 0 2rem;
        font-size: 1rem;
        font-weight: bold;
        color: $accent-text-color-light;
        @media (prefers-color-scheme: dark) {
            color: $accent-text-color-dark;
        }
    }
</style>