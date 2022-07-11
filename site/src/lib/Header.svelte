<script lang=ts>
    import { page } from "$app/stores"
    import { user } from "$lib/stores"
import { loop_guard } from "svelte/internal";
    import Skeleton from "./Skeleton.svelte";
    let dropdownContent: HTMLElement;
    let dropdownToggle: HTMLElement;
    let dropped = false;
    function handleClick(evt: MouseEvent) {
        let target = evt.target as HTMLElement;
        if (dropped && !dropdownContent.contains(target) && !dropdownToggle.contains(target)) {
            dropped = false;
        }
    }
    let userImage: Promise<any>;
    user.subscribe((val) => {
        if (val) {
            userImage = fetch(`https://api.soshiki.moe/user/${val.id}/avatar`).then(res => res.text());
        }
    });
</script>

<svelte:body on:click={handleClick} />

<nav class="header">
    <div class="header-logo">
        <span class="header-logo-kanji">織</span>
        <span class="header-logo-text">Soshiki</span>
    </div>
    <div class="header-nav">
        <a href="/browse" class:header-nav-selected={$page.url.pathname === "/browse"}>
            <i class="f7-icons header-nav-glyph">globe</i>
            <span class="header-nav-span">Browse</span>
        </a>
        <a href="/search" class:header-nav-selected={$page.url.pathname === "/search"}>
            <i class="f7-icons header-nav-glyph">search</i>
            <span class="header-nav-span">Search</span>
        </a>
        <a href="/library" class:header-nav-selected={$page.url.pathname === "/library"}>
            <i class="f7-icons header-nav-glyph">folder_fill</i>
            <span class="header-nav-span">Library</span>
        </a>
    </div>
    <div class="header-user dropdown">
        <i class="f7-icons dropdown-toggle header-user-glyph" bind:this={dropdownToggle} on:click={() => dropped = !dropped}>{dropped ? "chevron_up" : "chevron_down"}</i>
        {#if $user}
            {#await userImage}
                <i class="f7-icons header-user-image header-user-glyph">person_crop_circle_fill</i>
            {:then userImage}
                <img class="header-user-image" src={userImage} alt=""> 
            {/await}
        {:else}
            <i class="f7-icons header-user-image header-user-glyph">person_crop_circle_fill</i>
        {/if}
        <div class="dropdown-content" class:dropdown-content-hidden={!dropped} bind:this={dropdownContent}>
            {#if $user}
                <a href="/user" class="dropdown-item" on:click={() => dropped = false}>
                    <i class="f7-icons dropdown-item-glyph">person_circle_fill</i>
                    <span class="dropdown-item-span">Profile</span>
                </a>
                <a href="/account" class="dropdown-item" on:click={() => dropped = false}>
                    <i class="f7-icons dropdown-item-glyph">gear_alt_fill</i>
                    <span class="dropdown-item-span">Account</span>
                </a>
            {:else}
                <a href="https://api.soshiki.moe/user/login/discord/redirect" class="dropdown-item" on:click={() => dropped = false}>
                    <i class="f7-icons dropdown-item-glyph">person_crop_circle_fill</i>
                    <span class="dropdown-item-span">Login</span>
                </a>
            {/if}
        </div>
    </div>
</nav>

<style lang="scss">
    @use "../styles/global.scss" as *;
.header {
    font-size: 1rem;
    font-weight: bold;
    color: $accent-text-color-light;
    background-color: $accent-background-color-light;
    display: grid;
    grid-template-columns: 1fr 1.5fr 1fr;
    grid-template-areas: "logo nav user";
    padding: 0.5rem 2rem;
    &-logo {
        display: flex;
        grid-area: logo;
        align-items: center;
        justify-content: left;
        gap: 1rem;
        &-kanji {
            font-size: 2rem;
            font-weight: 600;
        }
        &-text {
            font-size: 1.5rem;
            font-weight: 700;
        }
    }
    &-nav {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        grid-area: nav;
        > a {
            padding: 0.5rem;
            width: min(100%, 12rem);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            border-radius: 0.5rem;
            &:hover {
                background-color: $hover-background-color-light;
                @media (prefers-color-scheme: dark) {
                    background-color: $hover-background-color-dark;
                }
            }
        }
        &-selected {
            background-color: mix($accent-background-color-light, $hover-background-color-light, 40%);
            @media (prefers-color-scheme: dark) {
                background-color: mix($accent-background-color-dark, $hover-background-color-dark);
            }
        }
    }
    &-user {
        display: flex;
        grid-area: user;
        align-items: center;
        justify-content: right;
        gap: 1rem;
        &-image {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            font-size: 2rem;
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
            top: calc(100% + 1rem);
            left: unset;
            right: -1.5rem;
            height: fit-content;
            width: fit-content;
            z-index: 1;
            background-color: $accent-background-color-light;
            border-radius: 0.5rem;
            border: 2px solid $dropdown-border-color-light;
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
            &:hover {
                background-color: $hover-background-color-light;
                border-radius: 0.5rem;
                @media (prefers-color-scheme: dark) {
                    background-color: $hover-background-color-dark;
                }
            }
        }
    }
    @media (prefers-color-scheme: dark) {
        background-color: $accent-background-color-dark;
        color: $accent-text-color-dark;
    }
    @media (max-width: 1000px) {
        grid-template-columns: 1fr 2fr 1fr;
    }
    @media (max-width: 800px) {
        .header-logo-text {
            display: none;
        }
    }
    @media (max-width: 650px) {
        grid-template-columns: 1fr 1fr;
        grid-template-areas: "logo user" "nav nav";
        gap: 1rem;
        .dropdown-content {
            top: calc(100% + 4.5rem);
        }
    }
    @media (max-width: 480px) {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        &-logo-kanji {
            font-size: 1.5rem;
        }
        &-nav {
            gap: 0.5rem;
        }
        &-user {
            &-image {
                width: 1.5rem;
                height: 1.5rem;
            }
            gap: 0.5rem;
        }
        .dropdown-content {
            top: calc(100% + 4rem);
            right: 0rem;
        }
        *[class*="-glyph"] {
            font-size: 1.125rem;
        }
    }
}
</style>