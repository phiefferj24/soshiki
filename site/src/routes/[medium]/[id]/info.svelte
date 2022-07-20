<script lang="ts">
    import { page } from "$app/stores";
    import Cookie from 'js-cookie';
    import manifest from "$lib/manifest";
import { currentMedium } from "$lib/stores";
    let medium = $page.params.medium;
    let id = $page.params.id;
    let info = fetch(`${manifest.api.url}/info/${medium}/${id}`, {
        headers: {
            Authorization: `Bearer ${Cookie.get("access")}`
        }
    }).then(res => res.json()).then(json => json.info);
    let headerTextHeight = 0;
</script>

<svelte:head>
    {#await info then info}
        <title>{info.title} - Soshiki</title> 
    {/await}
</svelte:head>

{#await info then info}
    <div class="info-header" style:--banner="url({info.anilist?.bannerImage || ""})">
        <div class="info-header-gradient"></div>
    </div>
    <div class="container" style:--height="{headerTextHeight}px">
        <div class="info-header-content">
            <div class="info-header-cover" style:--cover="url({
                info.anilist?.coverImage?.large || 
                info.anilist?.coverImage?.medium ||
                info.anilist?.coverImage?.small ||
                info.anilist?.coverImage?.color ||
                info.mal?.main_picture?.large ||
                info.mal?.main_picture?.medium ||
                info.cover ||
                ""
                })">
            </div>
            <div class="info-header-titles" bind:clientHeight={headerTextHeight}>
                <span class="info-header-title">{
                    info.anilist?.title?.english ||
                    info.mal?.alternative_titles?.en ||
                    info.title ||
                    ""
                }</span>
                <span class="info-header-subtitle">{
                    info.anilist?.title?.romaji ||
                    info.anilist?.title?.native ||
                    info.mal?.alternative_titles?.ja ||
                    info.alternative_titles?.[0] ||
                    ""
                }</span>
                <div class="info-header-statuses">
                    <div class="info-header-status">
                        <div class="info-header-status-chip" style:background-color={info.mal ? "green" : "red"}></div>
                        <a href={info.mal ? `https://myanimelist.net/${medium === "anime" ? "anime" : "manga"}/${info.mal.id}` : ""} class="info-header-status">MAL</a>
                    </div>
                    <div class="info-header-status">
                        <div class="info-header-status-chip" style:background-color={info.anilist ? "green" : "red"}></div>
                        <a href={info.anilist ? `https://anilist.co/${medium === "anime" ? "anime" : "manga"}/${info.anilist.id}`: ""} class="info-header-status">ANILIST</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="info-body-content">
            <div class="info-body-content-genres">
                {#if info.anilist?.genres}
                    {#each info.anilist.genres as genre}
                        <span class="info-body-content-genre">{genre}</span>
                    {/each}
                {:else if info.mal?.genres}
                    {#each info.mal.genres as genre}
                        <span class="info-body-content-genre">{genre.name}</span>
                    {/each}
                {/if}
            </div>
            <span class="info-body-content-description">{
                @html info.anilist?.description?.replace(/<script.*?>.*?<\/script>/g, "") ||
                info.mal?.synopsis ||
                ""
            }</span>
        </div>
    </div>
{/await}

<style lang="scss">
    @use "../../../styles/global.scss" as *;
    .info-header {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        height: 15rem;
        background-image: var(--banner);
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        &-titles {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        &-title {
            font-size: 2rem;
            font-weight: 800;
            z-index: 1;
        }
        &-subtitle {
            font-size: 1.25rem;
            font-weight: 600;
            z-index: 1;
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
        }
        &-gradient {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 50%;
            background: linear-gradient(to bottom, transparent, $background-color-light);
            @media (prefers-color-scheme: dark) {
                background: linear-gradient(to bottom, transparent, $background-color-dark);
            }
        }
        &-content {
            display: flex;
            align-items: flex-end;
            justify-content: flex-start;
            gap: 2rem;
        }
        &-cover {
            width: 10rem;
            height: 15rem;
            flex: 0 0 auto;
            background-image: var(--cover);
            background-position: center;
            background-size: cover;
            background-repeat: no-repeat;
            border-radius: 0.5rem;
            box-shadow: 0 0 0.5rem 0.1rem $background-color-light;
            @media (prefers-color-scheme: dark) {
                box-shadow: 0 0 0.5rem 0.1rem $background-color-dark;
            }
        }
        &-statuses {
            display: flex;
            flex-direction: row;
            gap: 2rem;
        }
        &-status {
            display: flex;
            gap: 0.25rem;
            align-items: center;
            font-size: 0.75rem;
            font-weight: bold;
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
            &-chip {
                width: 0.75rem;
                height: 0.75rem;
                border-radius: 50%;
            }
        }
    }
    .info-body-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 1.5rem;
        &-description {
            font-size: 1rem;
            font-weight: 600;
            line-height: 1.4;
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
        }
        &-genres {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            overflow: scroll;
            gap: 0.5rem;
        }
        &-genre {
            font-size: 1rem;
            font-weight: bold;
            background-color: $accent-background-color-light;
            color: $accent-text-color-light;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            @media (prefers-color-scheme: dark) {
                background-color: $accent-background-color-dark;
                color: $accent-text-color-dark;
            }
        }
    }
    .container {
        position: relative;
        transform: translateY(calc(var(--height) - 15rem));
        padding: 1rem 2rem 2rem 2rem;
        width: min(50rem, 100%);
        margin: 0 auto;
    }
</style>