<script lang="ts">
    import { FilterType, type Filter } from "soshiki-packages/source";

    export let filter: Filter;
</script>

{#if filter.type === FilterType.text}
    <input type="text" bind:value={filter.value}/>
{/if}

