<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import Cookie from 'js-cookie';
    import { user } from "$lib/stores";
  
    onMount(async () => {
        let type = $page.url.searchParams.get("type");
        switch(type) {
            case "discord": 
                await discord();
                break;
            case "mal":
                await mal();
                break;
            case "anilist":
                await anilist();
                break;
            default:
                await goto(`${$page.url.origin}`, { replaceState: true });
                break;
        }
        await goto(`/account`, { replaceState: true });
    });

    async function discord() {
        let id = $page.url.searchParams.get("id");
        if (id) {
            Cookie.set("id", id, { expires: 365 });
            let session = $page.url.searchParams.get("session");
            let expires = parseInt($page.url.searchParams.get("expires"));
            if (session && expires) {
                Cookie.set("session", session, { expires: new Date(Date.now() + expires) });
                user.set(await fetch(`https://api.soshiki.moe/user/${id}`).then(res => res.json()));
            }
        }
    }
    async function mal() {
        let id = Cookie.get("id");
        user.set(await fetch(`https://api.soshiki.moe/user/${id}`).then(res => res.json()));
    }
    async function anilist() {
        let id = Cookie.get("id");
        user.set(await fetch(`https://api.soshiki.moe/user/${id}`).then(res => res.json()));
    }
  </script>