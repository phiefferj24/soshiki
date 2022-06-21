<script lang="ts">
    import type { FilterBase } from "soshiki-aidoku/models/filter";
    import type { Optional } from "soshiki-aidoku/models/optional";
    import { Wasm } from "soshiki-aidoku/webassembly/wasm";
    import type { MangaPageResult } from "soshiki-aidoku/models/manga"

    const AIDOKU_BASE = "https://raw.githubusercontent.com/Aidoku/Sources/gh-pages"
    let sources: Promise<{[key: string]: string}[]> = fetch(AIDOKU_BASE + "/index.json").then(r => r.json());

    let installed: Wasm[] = []
    let res: MangaPageResult

    async function handleClick(source: {[key: string]: string}) {
        installed.push(await Wasm.start("main.wasm"))
        let fd = installed[0].storeStdValue([] as FilterBase[]);
        let pld = (installed[0].instance?.exports as any).get_manga_list(fd, 1)
        res = installed[0].readStdValue(pld) as MangaPageResult
        installed[0].removeStdValue(pld)
        installed[0].removeStdValue(fd)
    }
</script>
{#if res} 
<p>{res.manga[0].title}</p>
{:else} 
<p>waiting for love</p>
{/if}
{#await sources then sources}
{#each sources as source}
    <div>
        <img src={`${AIDOKU_BASE}/icons/${source.icon}`} alt={source.id} style="display: inline"/>
        <p style="display: inline">{source.name}</p>
        <button style="display: inline" on:click|once={() => handleClick(source)} value="get"></button>
    </div>
{/each}
{/await}
