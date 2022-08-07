import { readable, writable } from "svelte/store"
import type { Medium } from "soshiki-types"
import { browser } from "$app/env"

export const isDarkMode = readable(null, (set) => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const listener = (e: { matches: any }) => {set(e.matches)}
    media.addEventListener('change', listener)
    set(media.matches)
    return () => {media.removeEventListener('change', listener)}
})


let medium: Medium = (browser ? (JSON.parse(localStorage.getItem('soshiki') || "{}").currentMedium || 'manga') as Medium : 'manga') || 'manga'
export const currentMedium = writable(medium)
currentMedium.subscribe((medium) => {
    if (browser) {
        let storage = JSON.parse(localStorage.getItem('soshiki') || "{}") || {};
        storage.currentMedium = medium;
        localStorage.setItem('soshiki', JSON.stringify(storage));
    }
})


export const user = writable(null)