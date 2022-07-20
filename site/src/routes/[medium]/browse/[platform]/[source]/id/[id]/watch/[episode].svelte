<script lang="ts">
    import { page } from "$app/stores"
    import { goto } from "$app/navigation"
    import { onMount } from "svelte"

    let mounted = false;
    async function init() {
        if($page.params.medium !== "anime") {
            await goto($page.url.toString().replace(/\/watch\/([^/]*)/, "/read/$1"));
        }
        mounted = true;
    }
    onMount(init);
</script>