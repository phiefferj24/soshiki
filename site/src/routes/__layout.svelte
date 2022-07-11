<script lang="ts">
    import 'framework7-icons/css/framework7-icons.css';
    import Header from "$lib/Header.svelte"
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { user } from '$lib/stores';
    import Cookie from 'js-cookie';
    import { goto } from '$app/navigation';
    let mounted = false;
    async function init() {
        let session = Cookie.get("session");
        let id = Cookie.get("id");
        if (session && id) {
            setUser(id);
        } else if (id) {
            let res = await fetch(`https://api.soshiki.moe/user/login/discord/refresh?id=${id}`);
            let data = await res.json();
            Cookie.set("session", data.session, { expires: new Date(Date.now() + data.expires) });
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
</script>

<svelte:head>
    <title>{$page.url.pathname.split('/').length > 2 ? $page.url.pathname.split('/')[2].replace(/.?/, m => m.toUpperCase()) + ' - ' : ''}Soshiki</title>
</svelte:head>
{#if mounted}
    <Header />
    <slot />
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

    @media (prefers-color-scheme: dark) {
        html, body {
            background: $background-color-dark;
            color: $text-color-dark;
        }
    }
</style>