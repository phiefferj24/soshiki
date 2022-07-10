import { writable } from "svelte/store"
import { browser } from "$app/env"
import type { Medium } from "soshiki-types";
import { Source, type SourceType, install } from "soshiki-packages/source";
let installedMangaSources = browser ? localStorage.getItem('soshiki:installedMangaSources') : null;
let installedNovelSources = browser ? localStorage.getItem('soshiki:installedNovelSources') : null;
let installedAnimeSources = browser ? localStorage.getItem('soshiki:installedAnimeSources') : null;
export let sources = {
    manga: installedMangaSources ? installedMangaSources.split('\0').map((v) => {return {url: v.substring(0, v.indexOf(":")), type: v.substring(v.indexOf(":") + 1), source: null}}) : [],
    novel: installedNovelSources ? installedNovelSources.split('\0').map((v) => {return {url: v.substring(0, v.indexOf(":")), type: v.substring(v.indexOf(":") + 1), source: null}}) : [],
    anime: installedAnimeSources ? installedAnimeSources.split('\0').map((v) => {return {url: v.substring(0, v.indexOf(":")), type: v.substring(v.indexOf(":") + 1), source: null}}) : [],
};
for(let medium of ['manga', 'novel', 'anime']) {
    for(let source of sources[medium]) {
        await installSource(medium as Medium, source.type as SourceType, source.url);
    }
}

export async function addSource(medium: Medium, type: SourceType, url: string) {
    const source = sources[medium].find((source) => source.url === url);
    if(source) { return; }
    const newSource = await install(medium, type, url);
    sources[medium].push({url: url, type: type, source: newSource});
}

export async function installSource(medium: Medium, type: SourceType, url: string) {
    if(!sources[medium].find((source) => source.url === url).source) {
        const source = await install(medium, type, url);
        sources[medium].find((source) => source.url === url).source = source;
    }
}