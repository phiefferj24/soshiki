<script lang="ts">
    import Footer from "$lib/Footer.svelte";
</script>

<div class="container">
    <slot />
</div>
<div style="height: 3rem; width: 100%;"></div>
<Footer/>

<style lang="scss">
    .container {
        padding: 2rem;
        width: min(50rem, 100%);
        margin: 0 auto;
    }
</style>