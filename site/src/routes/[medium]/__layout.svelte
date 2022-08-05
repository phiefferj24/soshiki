<script lang="ts">
    import { page } from "$app/stores"
    import Footer from "$lib/Footer.svelte"
    let fullscreen = false;
    page.subscribe(val => fullscreen = val.url.searchParams.get("fullscreen") === "true");
</script>

<slot />
{#if !fullscreen}
    <div style="height: 3rem; width: 100%;"></div>
    <Footer/>
{/if}