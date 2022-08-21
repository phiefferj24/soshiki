<script lang="ts">
    import ListingCard from "$lib/listing/ListingCard.svelte";
    import { onMount } from "svelte";
    import { tracker } from "$lib/stores";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import LoadingBar from "$lib/LoadingBar.svelte";
    import Dropdown from "$lib/Dropdown.svelte";
    import List from "$lib/List.svelte";

    let library: {[category: string]: string[]};
    let category = $page.params.category;
    $: categoryName = category === "" ? "All" : category;

    $: updateCategory(category);

    async function updateCategory(cat: string) {
        category = cat;
        await goto(`/manga/library/${cat}`);
    }

    async function getItem(id: string) {
        return await fetch(`https://api.soshiki.moe/info/manga/${id}`).then(res => res.json());
    }

    let mounted = false;
    async function init() {
        library = await $tracker.getLibrary("manga");
        mounted = true;
    }
    onMount(init);

    let newCategoryText = "";
    let newCategoryPopup = false;
</script>

{#if mounted}
    <div class="overlay" class:overlay-hidden={!newCategoryPopup} />
    <div class="container">
        <div class="popup" class:popup-hidden={!newCategoryPopup}>
            <List title="New Category" exiting={true} on:click={() => { newCategoryText = ""; newCategoryPopup = false }}>
                <div class="list-content">
                    <input class="list-content-input" type="text" bind:value={newCategoryText} placeholder="New Category Name" />
                    <i class="f7-icons list-content-glyph" on:click={async () => {
                        if (Object.keys(library).includes(newCategoryText)) return;
                        await $tracker.addLibraryCategory("manga", newCategoryText);
                        library = await $tracker.getLibrary("manga");
                        newCategoryText = "";
                        newCategoryPopup = false;
                    }}>plus</i>
                </div>
            </List>
        </div>
        <div class="heading">
            <span class="heading-title">Library</span>
            <span class="heading-count">{(library[category] ?? []).length}</span>
        </div>
        <div class="heading">
            <Dropdown label="Category" bind:title={categoryName}>
                <div class="dropdown-item" on:click={() => category = ""}>All</div>
                {#each Object.keys(library).filter(cat => cat !== "") as cat}
                    <div class="dropdown-item" on:click={() => category = cat}>{cat}</div>
                {/each}
            </Dropdown>
            <div class="heading-button" on:click={() => newCategoryPopup = true}>
                <i class="f7-icons heading-button-glyph">plus</i>
                <span class="heading-button-title">Add Category</span>
            </div>
        </div>
        <div class="items">
            {#each library[category] ?? [] as item}
                {#await getItem(item) then item}
                    <div class="item">
                        <ListingCard 
                            cover={
                                item.info.anilist?.coverImage?.large || 
                                item.info.anilist?.coverImage?.medium ||
                                item.info.anilist?.coverImage?.small ||
                                item.info.anilist?.coverImage?.color ||
                                item.info.mal?.main_picture?.large ||
                                item.info.mal?.main_picture?.medium ||
                                item.info.cover ||
                                ""
                            } 
                            title={
                                item.info.anilist?.title?.english ||
                                item.info.mal?.alternative_titles?.en ||
                                item.info.title ||
                                ""
                            } 
                            subtitle={
                                item.info.anilist?.title?.romaji ||
                                item.info.anilist?.title?.native ||
                                item.info.mal?.alternative_titles?.ja ||
                                item.info.alternative_titles?.[0] ||
                                ""
                            } 
                            href={`/manga/${item.id}/info`}
                        />
                    </div>
                {/await}
            {/each}
            {#each new Array(12 - (library[category] ?? []).length % 12) as _}
                <div class="result"></div>
            {/each}
        </div>
    </div>
{:else}
    <LoadingBar />
{/if}


<style lang='scss'>
    @use "../../../../styles/global.scss" as *;
    .container {
        width: min(50rem, 100%);
        margin: 2rem auto;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .items {
        display: flex;
        flex-wrap: wrap;
        justify-content: left;
        gap: 2rem;
    }
    .item {
        width: 10rem;
        height: 15rem;
    }
    .heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 1.25rem;
        font-weight: bolder;
        &-count {
            font-size: 2rem;
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
        }
        &-title {
            font-size: 2rem;
        }
        &-button {
            display: flex;
            align-items: center;
            gap: 1rem;
            cursor: pointer;
            &-title {
                font-weight: semibold;
            }
        }
    }
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1;
        &-hidden {
            display: none;
        }
    }
    .popup {
        z-index: 2;
        &-hidden {
            display: none;
        }
    }
    .list-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.25rem;
        padding: 0.5rem;
        &-input {
            margin: 0.25rem;
            padding: 0.5rem;
            width: 100%;
            flex-shrink: 1;
            font-size: 1rem;
            border-radius: 0.5rem;
            background-color: $accent-background-color-light;
            color: $text-color-light;
            border: none;
            @media (prefers-color-scheme: dark) {
                background-color: $accent-background-color-dark;
                color: $text-color-dark;
            }
        }
        &-glyph {
            cursor: pointer;
        }
    }

    @media only screen and (max-width: 800px) {
        .item {
            width: unset;
            height: unset;
            aspect-ratio: 2 / 3;
            flex: 1 0 21%;
        }
    }
    @media only screen and (max-width: 480px) {
        .item {
            flex-basis: 34%;
        }
    }
</style>