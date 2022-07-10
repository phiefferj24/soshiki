<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
  
    onMount(async () => {
      await goto(`${$page.url.toString()}/profile`, { replaceState: true });
    });
  </script>