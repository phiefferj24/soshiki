<script lang="ts">
  import { currentMedium } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  onMount(async () => {
    await goto(`/${$currentMedium}/browse`, { replaceState: true });
  });
</script>