<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { user } from "$lib/stores";
  
    onMount(async () => {
        if ($user) {
            await goto(`${$page.url.toString()}/${$user.id}/profile`, { replaceState: true });
        } else {
            await goto(`${$page.url.origin}`, { replaceState: true });
        }
    });
  </script>