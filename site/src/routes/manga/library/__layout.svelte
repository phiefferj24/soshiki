<script lang="ts" context="module">
    export async function load({ fetch }) {
        let library = await fetch(`https://api.soshiki.moe/library/manga`)
        console.log(await library.text())
        return {
            stuff: {
                library
            }
        }
    }
</script>

<slot />