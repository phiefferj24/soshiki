<script lang="ts">
    import { user } from "$lib/stores";
    import { onMount } from "svelte";
    let mounted = false;
    let username: string;
    async function init() {
        let userData = await fetch(`https://api.soshiki.moe/user/${$user.id}/info`).then(res => res.json());
        if (userData.username) {
            username = userData.username;
        }
        mounted = true;
    }   
    onMount(init);
</script>

{#if mounted}
    <h1>Account Info for {username}</h1>
    <h3>Connections</h3>
{/if}
