<script lang="ts">
    import manifest from "$lib/manifest";
    import { page } from "$app/stores"
    import { onMount } from "svelte";
    import Cookie from 'js-cookie';
    import LoadingBar from "$lib/LoadingBar.svelte";
    import ListingCard from "$lib/listing/ListingCard.svelte";

    let mounted = false;
    let library: string[] = [];

    async function init() {
        let res = await fetch(`${manifest.api.url}/library/${$page.params.medium}`, {
            headers: { Authorization: `Bearer ${Cookie.get("access")}` }
        });
        library = await res.json();
        mounted = true;
    }
    onMount(init);

    async function getItem(id: string) {
        return await fetch(`${manifest.api.url}/info/${$page.params.medium}/${id}`).then(res => res.json());
    }
</script>

{#if mounted}
    <div class="heading">
        <span class="heading-title">Library</span>
        <span class="heading-count">{library.length}</span>
    </div>
    <div class="items">
        {#each library as item}
            {#await getItem(item) then item}
                <div class="item">
                    <ListingCard 
                        cover={item.info.cover} 
                        title={item.info.title} 
                        subtitle={item.info.author} 
                        href={`/${$page.params.medium}/${item.id}/info`}
                    />
                </div>
            {/await}
        {/each}
        {#each new Array(12 - library.length % 12) as _}
            <div class="result"></div>
        {/each}
    </div>
{:else}
    <LoadingBar />
{/if}

<style lang='scss'>
    @use "../../../styles/global.scss" as *;
    .items {
        display: flex;
        flex-wrap: wrap;
        justify-content: left;
        gap: 2rem;
        margin-top: 2rem;
    }
    .item {
        width: 10rem;
        height: 15rem;
    }
    .heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 2rem;
        font-weight: bolder;
        &-count {
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
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