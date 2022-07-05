<script>
    import 'framework7-icons/css/framework7-icons.css';
    import Header from "$lib/Header.svelte"
    import Footer from "$lib/Footer.svelte"
</script>

<Header />
<slot />
<Footer />

<style lang="scss" global>
    @use "../styles/global.scss" as *;
    :root {
        font-family: 'Inter', sans-serif;
    }
    html, body {
        margin: unset;
        background: $background-color-light;
        color: $text-color-light;
    }
    a {
        color: inherit;
        text-decoration: none;
    }
    * {
        box-sizing: border-box;
    }

    @media (prefers-color-scheme: dark) {
        html, body {
            background: $background-color-dark;
            color: $text-color-dark;
        }
    }
</style>