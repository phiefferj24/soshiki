<script lang="ts">
    import 'framework7-icons/css/framework7-icons.css';
    import Header from '$lib/Header.svelte';
    import Footer from '$lib/Footer.svelte';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { currentMedium, user } from '$lib/stores';
    import Cookie from 'js-cookie';
    import { goto } from '$app/navigation';
    import LoadingBar from '$lib/LoadingBar.svelte';
    import * as Sources from '$lib/sources';
    import type { Medium } from 'soshiki-types';
    let mounted = false;
    async function init() {
        await Sources.init();
        let access = Cookie.get("access");
        let refresh = Cookie.get("refresh");
        let id = Cookie.get("id");
        if (access && id) {
            setUser(id);
        } else if (id && refresh) {
            let res = await fetch(`https://api.soshiki.moe/user/login/refresh?refresh=${refresh}`);
            let data = await res.json();
            Cookie.set("access", data.access, { expires: new Date(Date.now() + data.expires) });
            Cookie.set("refresh", data.refresh, { expires: new Date(Date.now() + data.expires * 2) });
            setUser(data.id);
        } else if ($page.url.pathname !== "/account/redirect") {
            await goto("https://api.soshiki.moe/user/login/discord/redirect", { replaceState: true });
        }
        mounted = true;
    }
    async function setUser(id: string) {
        let res = await fetch(`https://api.soshiki.moe/user/${id}`);
        let data = await res.json();
        if (data) {
            user.set(data);
        }
    }
    onMount(init);

    let fullscreen = false;
    let selector = false;
    const isMedium = (medium: string) => medium === "anime" || medium === "novel" || medium === "manga";
    page.subscribe(val => {
        fullscreen = val.url.searchParams.get("fullscreen") === "true";
        if (isMedium(val.url.pathname.substring(1, 6))) { 
            currentMedium.set(val.url.pathname.substring(1, 6) as Medium) 
            selector = true;
        } else {
            selector = false;
        }
    })
</script>

<svelte:head>
    <title>{$page.url.pathname.split('/').length > 2 ? $page.url.pathname.split('/')[2].replace(/.?/, m => m.toUpperCase()) + ' - ' : ''}Soshiki</title>
</svelte:head>
{#if mounted}
    {#if !fullscreen}
        <Header />
    {/if}
    <slot />
    {#if !fullscreen}
        <div style="height: 3rem; width: 100%;"></div>
        <Footer bind:selector />
    {/if}
{:else}
    <LoadingBar />
{/if}

<style lang="scss" global>
    @use "../styles/global.scss" as *;
    :root {
        font-family: 'Inter', sans-serif;
    }
    html, body {
        margin: unset;
        background: $background-color-light;
        color: $text-color-light;
    }
    a {
        text-decoration: none;
        color: inherit;
        font-size: inherit;
        font-weight: inherit;
    }
    a[class*="email"], a[class*="hyperlink"] {
        text-decoration: none;
        color: $link-color-light;
        @media (prefers-color-scheme: dark) {
            color: $link-color-dark;
        }
        &:hover {
            text-decoration: underline;
        }
    }
    * {
        box-sizing: border-box;
    }
    button, input[type="submit"], input[type="reset"], input[type="file"] {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        outline: inherit;
    }

    @media (prefers-color-scheme: dark) {
        html, body {
            background: $background-color-dark;
            color: $text-color-dark;
        }
    }
</style>