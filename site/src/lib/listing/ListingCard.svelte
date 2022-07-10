<script lang="ts">
    import { page } from "$app/stores";
    export let cover: string = '';
    export let title: string = '';
    export let subtitle: string = '';
    export let id: string = '';
    export let sub: string = 'info';
    $: rtitle = title.length > 40 ? title.substring(0, 37).trim() + '...' : title;
    $: rsubtitle = subtitle.length > 40 ? subtitle.substring(0, 37).trim() + '...' : subtitle;
</script>

<a href={`/${$page.params.medium}/${id}/${sub}`} class="listing-card" style:--cover="url({cover})">
    <span class="listing-card-title">{rtitle}</span>
    <span class="listing-card-subtitle">{rsubtitle}</span>
</a>

<style lang="scss">
    @use "../../styles/global.scss" as *;
    .listing-card {
        display: flex;
        flex-direction: column;
        align-items: left;
        justify-content: flex-end;
        font-weight: bold;
        width: 100%;
        height: 100%;
        padding: 0.5rem;
        background-image: linear-gradient(transparent 40%, #ddd), var(--cover);
        @media (prefers-color-scheme: dark) {
            background-image: linear-gradient(transparent 40%, #222), var(--cover);
        }
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        border-radius: 0.5rem;
        box-shadow: 0 0 0.5rem 0 rgba(0, 0, 0, 0.5);
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        &:hover {
            box-shadow: 0 0 0.5rem 0 rgba(0, 0, 0, 0.5);
        }
        &-title {
            font-size: 0.9rem;
        }
        &-subtitle {
            font-size: 0.6rem;
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
        }
    }
</style>