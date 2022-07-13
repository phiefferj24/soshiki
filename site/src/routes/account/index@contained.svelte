<script lang="ts">
    import { user } from "$lib/stores";
    import { page } from "$app/stores";
    import Cookie from 'js-cookie';
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
    <h1>Account Info for {username}</h1>
    <div class="account-section">
        <div class="account-section-header">
            <span>Connections</span>
        </div>
        <div class="account-section-item">
            <span>MyAnimeList</span>
            <div>
                {#if mal}
                    <span>Connected - {mal.name}</span>
                {:else}
                    <span>Not Connected</span>
                    <a href="{"https://api.soshiki.moe/user/connect/mal/redirect?token=" + Cookie.get("access")}">Connect</a>
                {/if}
            </div>
        </div>
        <div class="account-section-item">
            <span>AniList</span>
            <div>
                {#if anilist}
                    <span>Connected - {anilist.name}</span>
                {:else}
                    <span>Not Connected</span>
                    <a href="{"https://api.soshiki.moe/user/connect/anilist/redirect?token=" + Cookie.get("access")}">Connect</a>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    @use "../../styles/global.scss" as *;
    .account-section {
        border-radius: 0.5rem;
        border: 3px solid $accent-background-color-light;
        @media (prefers-color-scheme: dark) {
            border-color: $accent-background-color-dark;
        }

        &-header {
            background-color: $accent-background-color-light;
            font-size: 1.25rem;
            font-weight: bold;
            padding: 0.5rem;
            border-radius: 0.25rem 0.25rem 0 0;
            @media (prefers-color-scheme: dark) {
                background-color: $accent-background-color-dark;
            }
        }
        &-item {
            padding: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            &:not(:last-child) {
                border-bottom: 3px solid $accent-background-color-light;
                @media (prefers-color-scheme: dark) {
                    border-bottom-color: $accent-background-color-dark;
                }
            }
        }
    }
</style>
