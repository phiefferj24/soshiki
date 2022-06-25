<script lang=ts context=module>
    export enum ListingType {
        Manga = "manga",
        Anime = "anime",
        Novel = "novel"
    }
</script>
<script lang=ts>
import Header from "$lib/Header.svelte";

    export let info: {
        type: ListingType,
        title: string,
        image: string,
        releasedCount?: number,
        totalCount?: number,
        hyperlink?: string
    };
    
</script>

<div class="card" style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.722)), url({info.image});">
    <a class="card-content" href={info.hyperlink}>
        <p class="title">{info.title.length > 40 ? info.title.substring(0, 37) + "…" : info.title}</p>
        {#if info.releasedCount && info.totalCount}
            <p class="subtitle">{info.type === ListingType.Anime ? "Episode" : "Chapter"} {info.releasedCount} / {info.totalCount}</p>
        {/if}
    </a>
</div>

<style lang=scss>
    .card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 10rem;
        height: 15rem;
        background-color: #fff;
        border-radius: 0.75rem;
        box-shadow: 0 0 2rem rgba(0, 0, 0, 0.2);
        margin: 1rem;
        background-size: cover;
        background-position: center;
    }
    .card-content {
        width: 100%;
        height: 100%;
        color: white;
        display: flex;
        flex-direction: column;
        text-decoration: none;
    }
    .title {
        font-size: 1rem;
        font-weight: bold;
        margin: auto 0 0;
        padding: 0.5rem 0.5rem 0.25rem;
        text-align: left;
    }
    .subtitle {
        font-size: 0.75rem;
        margin: 0;
        padding: 0 0.5rem 0.5rem;
        text-align: left;
    }
</style>