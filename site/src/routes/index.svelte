<script lang="ts">
	import { AidokuSource } from 'aidoku-ts/aidokuSource';
    import Header from "../lib/Header.svelte";
    import { Wasm } from "aidoku-ts/webassembly/wasm";
    import type { MangaPageResult } from "aidoku-ts/models/manga";
    import ListingCard, { ListingType } from "$lib/listing/ListingCard.svelte";
    import Listing from "$lib/listing/Listing.svelte";
    import { onMount } from "svelte";
    // async function e() {
    //     await Wasm.start("mangadex.wasm")
    //     let fd = Wasm.storeStdValue([])
    //     let pld = (Wasm.instances.get("mangadex.wasm").exports as any).get_manga_list(fd, 1)
    //     let res = Wasm.readStdValue(pld) as MangaPageResult
    //     Wasm.removeStdValue(pld)
    //     Wasm.removeStdValue(fd)
    //     console.log(res)
    //     return res
    // }
    // let val = e();
    console.log("initting")
    async function f() {
        let source = new AidokuSource();
        await source.init("/en.tcbscans-v2.aix");
        let list = source.getMangaList([], 1);
        console.log(list);
    }
    onMount(f);
</script>
<Header />
<!-- 
{#await returned then returned} 

{/await} -->

<!-- {#await val}
<p>waiting</p>
{:then res}
<p>{res}</p>
{/await} -->

<style lang="scss" global>
	@use "../global.scss" as *;
	@use "../global-dark.scss" as *;
	@use "../global-light.scss" as *;
</style>