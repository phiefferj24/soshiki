import { readable, writable } from "svelte/store"
import { Medium } from "./types"
import { browser } from "$app/env"
export const isDarkMode = readable(null, (set) => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const listener = (e: { matches: any }) => {set(e.matches)}
    media.addEventListener('change', listener)
    set(media.matches)
    return () => {media.removeEventListener('change', listener)}
})

let medium: Medium = (browser ? localStorage.getItem('soshiki:currentMedium') as Medium : Medium.manga) || Medium.manga
export const currentMedium = writable(medium)
currentMedium.subscribe((medium) => {
    if (browser) {
        localStorage.setItem('soshiki:currentMedium', medium)
    }
})