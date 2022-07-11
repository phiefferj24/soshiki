<script lang="ts">
    import type { Medium } from 'soshiki-types'
    import { currentMedium } from '$lib/stores'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { browser } from '$app/env'
    let dropdownContent: HTMLElement;
    let dropdownToggle: HTMLElement;
    let dropped = false;

    const types = [
        {name: "Manga", type: 'manga' as Medium, icon: "book_fill"},
        {name: "Anime", type: 'anime' as Medium, icon: "film_fill"},
        {name: "Light Novels", type: 'novel' as Medium, icon: "doc_text_fill"},
    ]

    async function mediumChanged() {
        await goto(`/${$currentMedium}/${$page.url.pathname.slice($page.url.pathname.slice(1).indexOf('/') + 2)}`)
    }
    let typeIndex = $currentMedium ? types.findIndex(type => type.type === $currentMedium) : 0;

    function handleClick(evt: MouseEvent) {
        let target = evt.target as HTMLElement;
        if (dropped && !dropdownContent.contains(target) && !dropdownToggle.contains(target)) {
            dropped = false;
        }
    }
</script>

<svelte:body on:click={handleClick} />

<div class="footer">
    <div class="footer-row dropdown">
        <i class="f7-icons dropdown-item-glyph">{types[typeIndex].icon}</i>
        <span class="dropdown-item-span">{types[typeIndex].name}</span>
        <i class="f7-icons dropdown-toggle footer-medium-glyph" bind:this={dropdownToggle} on:click={() => dropped = !dropped}>{dropped ? "chevron_down" : "chevron_up"}</i>
        <div class="dropdown-content" class:dropdown-content-hidden={!dropped} bind:this={dropdownContent}>
            {#each types as type, index} 
                <div class="dropdown-item" on:click={() => {dropped = false; typeIndex = index; $currentMedium = type.type; mediumChanged()}}>
                    <i class="f7-icons dropdown-item-glyph">{type.icon}</i>
                    <span class="dropdown-item-span">{type.name}</span>
                </div>
            {/each}
        </div>
    </div>
    <a href="/about" class="footer-link">
        <i class="f7-icons footer-link-glyph">question_circle_fill</i>
    </a>
</div>

<style lang="scss" global>
    @use "../styles/global.scss" as *;
    .footer {
        font-size: 1rem;
        font-weight: bold;
        color: $accent-text-color-light;
        background-color: $accent-background-color-light;
        display: flex;
        gap: min(10%, 5rem);
        padding: 0.5rem 2rem;
        position: fixed;
        bottom: 0;
        width: 100%;
        align-items: bottom;
        @media (prefers-color-scheme: dark) {
            background-color: $accent-background-color-dark;
            color: $accent-text-color-dark;
        }
        &-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            position: absolute;
        }
        &-link {
            margin-left: auto;
        }
        &-heading {
            font-size: 0.75rem;
        }
    }
    .dropdown {
        position: relative;
        &-toggle {
            cursor: pointer;
        }
        &-content {
            display: flex;
            flex-direction: column;
            position: absolute;
            bottom: calc(100% + 1rem);
            left: -0.5rem;
            z-index: 1;
            background-color: $accent-background-color-light;
            border-radius: 0.5rem;
            border: 2px solid $dropdown-border-color-light;
            max-height: 30vh;
            overflow-y: scroll;
            @media (prefers-color-scheme: dark) {
                background-color: $accent-background-color-dark;
                border: 2px solid $dropdown-border-color-dark;
            }
            &-hidden {
                display: none;
            }
        }
        &-item {
            display: flex;
            align-items: center;
            padding: 0.5rem;
            gap: 1rem;
            cursor: pointer;
            &:hover {
                background-color: $hover-background-color-light;
                border-radius: 0.5rem;
                @media (prefers-color-scheme: dark) {
                    background-color: $hover-background-color-dark;
                }
            }
            &-image {
                width: 1.5rem;
                height: 1.5rem;
                border-radius: 0.25rem;
            }
        }
    }
    @media (max-width: 480px) {
        .footer {
            font-size: 0.75rem;
            &-row {
                gap: 0.75rem;
            }
        }
        .dropdown {
            &-content {
                left: -0.25rem;
            }
            &-item {
                &-image {
                    width: 1.125rem;
                    height: 1.125rem;
                }
            }
        }
        *[class*="-glyph"] {
            font-size: 1.125rem !important;
        }
    }
</style>