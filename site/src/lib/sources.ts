import { writable } from "svelte/store"
import { browser } from "$app/env"
import type { Medium } from "soshiki-types";
import { Source, type SourceType, install } from "soshiki-packages/source";
import type { MangaSource } from "soshiki-packages/manga/mangaSource";
let stored = browser ? JSON.parse(localStorage.getItem('soshiki') || "{}") : {};
let installedMangaSources = stored.installedMangaSources || [];
let installedNovelSources = stored.installedNovelSources || [];
let installedAnimeSources = stored.installedAnimeSources || [];
export let installedSources = {
    manga: installedMangaSources,
    novel: installedNovelSources,
    anime: installedAnimeSources,
};
export let sources = {
    manga: {} as {[key: string]: MangaSource[]},
    novel: {} as {[key: string]: Source[]},
    anime: {} as {[key: string]: Source[]},
};

export async function init() {
    for(let medium of ['manga', 'novel', 'anime']) {
        for(let platform of Object.keys(installedSources[medium])) {
            for(let source of installedSources[medium][platform]) {
                const sourceObject = await install(medium as Medium, platform as SourceType, source, source.listUrl);
                if(!sources[medium][platform]) {
                    sources[medium][platform] = [];
                }
                sources[medium][platform] = [...sources[medium][platform], sourceObject];
            }
        }
    }
}

export async function removeSource(medium: Medium, platform: SourceType, id: string) {
    let storage = browser ? JSON.parse(localStorage.getItem('soshiki') || '{}') : {};
    sources[medium][platform] = sources[medium][platform].filter(source => source.id !== id);
    switch (medium) {
        case 'manga':
            storage.installedMangaSources[platform] = storage.installedMangaSources[platform].filter(source => source.id !== id);
            break;
        case 'novel':
            storage.installedNovelSources[platform] = storage.installedNovelSources[platform].filter(source => source.id !== id);
            break;
        case 'anime':
            storage.installedAnimeSources[platform] = storage.installedAnimeSources[platform].filter(source => source.id !== id);
            break;
    }
    if(browser) {
        localStorage.setItem('soshiki', JSON.stringify(storage));
    }
}

export async function installSource(medium: Medium, type: SourceType, json: any) {
    const sourceObject = await install(medium, type, json, json.listUrl);
    if(!sources[medium][type]) {
        sources[medium][type] = [];
    }
    sources[medium][type] = [...sources[medium][type], sourceObject];
    if(browser) {
        let storage = JSON.parse(localStorage.getItem('soshiki') || "{}") || {};
        switch(medium) {
            case 'manga':
                if(!storage.installedMangaSources) {
                    storage.installedMangaSources = {};
                }
                if(!storage.installedMangaSources[type]) {
                    storage.installedMangaSources[type] = [];
                }
                storage.installedMangaSources[type] = [...storage.installedMangaSources[type], json];
                break;
            case 'novel':
                if(!storage.installedNovelSources) {
                    storage.installedNovelSources = {};
                }
                if(!storage.installedNovelSources[type]) {
                    storage.installedNovelSources[type] = [];
                }
                storage.installedNovelSources[type] = [...storage.installedNovelSources[type], json];
                break;
            case 'anime':
                if(!storage.installedAnimeSources) {
                    storage.installedAnimeSources = {};
                }
                if(!storage.installedAnimeSources[type]) {
                    storage.installedAnimeSources[type] = [];
                }
                storage.installedAnimeSources[type] = [...storage.installedAnimeSources[type], json];
                break;
        }
        localStorage.setItem('soshiki', JSON.stringify(storage));
    }
}