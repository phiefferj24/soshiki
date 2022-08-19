<script lang="ts">
    import { goto } from "$app/navigation";
    import List from "$lib/List.svelte";
    import LoadingBar from "$lib/LoadingBar.svelte";
    import { mangaSourceClasses, MangaSourceType } from "soshiki-packages/manga/mangaSource";
</script>

<h1>Settings</h1>
<div class="lists">
    <List title="Import Backup" collapsing={true}>
        {#each Object.keys(MangaSourceType) as mangaPlatform}
            {#if typeof mangaSourceClasses[mangaPlatform]["importBackup"] !== "undefined"}
                <div class="list-item">
                    <span class="list-item-title">{mangaPlatform.charAt(0).toUpperCase() + mangaPlatform.substring(1)}</span>
                    <span class="list-item-button" on:click={async () => {
                        await goto(`/settings/import/${mangaPlatform}`);
                    }}>Import</span>
                </div>
            {/if}
        {/each}
    </List>
</div>

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
