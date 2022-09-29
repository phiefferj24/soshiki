<script lang="ts">
    import { user } from "$lib/stores";
    import { goto } from "$app/navigation";
    import Cookie from 'js-cookie';
    import List from "$lib/List.svelte";
    import LoadingBar from "$lib/LoadingBar.svelte";
    import Container from '$lib/Container.svelte';
    let mounted = false;
    let username: string;
    let mal: any;
    let anilist: any;
    async function init() {
        let userData = await fetch(`https://api.soshiki.moe/user/${$user.id}/info`).then(res => res.json());
        if (userData.username) {
            username = userData.username;
        }
        if ($user.data) {
            if ($user.data.mal) {
                mal = $user.data.mal;
            }
            if ($user.data.anilist) {
                anilist = $user.data.anilist;
            }
        }
        mounted = true;
    }   
    user.subscribe(async (val) => {
        if (val) {
            await init();
        }
    });
</script>

{#if mounted}
    <Container>
        <h1>Account Info for {username}</h1>
        <div class="lists">
            <List title="Connections" collapsing={true}>
                <div class="list-item">
                    <div class="list-item-row">
                        <img class="list-item-image" src={mal?.picture || ""} alt={mal?.name || ""}>
                        <div class="list-item-column">
                            <a class="list-item-title" href={mal ? `https://myanimelist.net/profile/${mal.name}` : ""}>MyAnimeList</a>
                            <span class="list-item-subtitle">Logged in as {mal?.name || ""}</span>
                        </div>
                    </div>
                    <span class="list-item-button" on:click={async () => {
                        if (mal) {
                            await fetch(`https://api.soshiki.moe/user/connect/mal`, {
                                method: "DELETE",
                                headers: { "Authorization": `Bearer ${Cookie.get("access")}` }
                            });
                            mal = null;
                        } else {
                            await goto(`https://api.soshiki.moe/user/connect/mal/redirect?access=${Cookie.get("access")}`);
                        }
                    }}>{mal ? "Disconnect" : "Connect"}</span>
                </div>
                <div class="list-item">
                    <div class="list-item-row">
                        <img class="list-item-image" src={anilist?.avatar?.large || anilist?.avatar?.medium || ""} alt={anilist?.name || ""}>
                        <div class="list-item-column">
                            <a class="list-item-title" href={anilist ? `https://anilist.co/user/${anilist.name}` : ""}>AniList</a>
                            <span class="list-item-subtitle">Logged in as {anilist?.name || ""}</span>
                        </div>
                    </div>
                    <span class="list-item-button" on:click={async () => {
                        if (anilist) {
                            await fetch(`https://api.soshiki.moe/user/connect/anilist`, {
                                method: "DELETE",
                                headers: { "Authorization": `Bearer ${Cookie.get("access")}` }
                            });
                            anilist = null;
                        } else {
                            await goto(`https://api.soshiki.moe/user/connect/anilist/redirect?access=${Cookie.get("access")}`);
                        }
                    }}>{anilist ? "Disconnect" : "Connect"}</span>
            </List>
        </div>
    </Container>
{:else}
    <LoadingBar />
{/if}

<style lang="scss">
    @use "../../styles/global.scss" as *;
    .lists {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .list-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
        &-column {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            gap: 0.25rem;
        }
        &-row {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            gap: 1rem;
        }
        &-title {
            font-size: 1rem;
            font-weight: bold;
        }
        &-subtitle {
            font-size: 0.75rem;
            font-weight: bold;
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
        }
        &-image {
            width: 3rem;
            height: 3rem;
            border-radius: 25%;
        }
        &-button {
            font-size: 1rem;
            font-weight: bold;
            color: $accent-text-color-light;
            border-radius: 0.5rem;
            padding: 0.25rem 0.5rem;
            user-select: none;
            cursor: pointer;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
            &:hover {
                background-color: $accent-background-color-light;
                @media (prefers-color-scheme: dark) {
                    background-color: $accent-background-color-dark;
                }
            }
        }
    }
</style>
