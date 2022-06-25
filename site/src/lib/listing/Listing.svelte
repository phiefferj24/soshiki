<script lang="ts">
    import type { Manga, MangaSource } from "../../../../packages/manga/mangaSource";
    import ListingCard, { ListingType } from "./ListingCard.svelte";

    export let info: {
        name: string,
        id: string,
        type: ListingType,
        source: MangaSource
    };

    let page = 1;

    let listingInfo = info.source.getMangaListing(info.id, page);
</script>

<h1>{info.name}</h1>
{#await listingInfo then listingInfo}
{#each listingInfo.manga as manga}
    <ListingCard info={{
        type: info.type,
        title: manga.title,
        image: manga.cover,
        hyperlink: `/${info.type}/${info.source.type}/${info.source.name}/${manga.id}`,
    }}/>
{/each}
{/await}