<script lang="ts">
    import bplist from "bplist-parser"
    import * as JSB from "buffer"
    globalThis.Buffer = JSB.Buffer

    let files: FileList;
    $: file = files?.[0]
    $: { if (typeof file !== 'undefined') convert(file) }

    let completed: string;

    const map: {[source: string]: {id: string, manga: (id: string) => string}} = {
        "multi.mangadex": {
            id: "MangaDex",
            manga: (id: string) => { return id }
        },
        "en.nepnep": {
            id: "Mangasee",
            manga: (id: string) => { return id }
        },
        "en.manganato": {
            id: "Manganato",
            manga: (id: string) => { return id }
        },
        "en.mangabat": {
            id: "MangaBat",
            manga: (id: string) => { return id }
        },
        "en.readm": {
            id: "Readm",
            manga: (id: string) => { return id.split("/manga/")[1] }
        },
        "en.mangapill": {
            id: "MangaPill",
            manga: (id: string) => { return id.split("/manga/")[1] }
        }
    }

    async function convert(file: File) {
        if (typeof completed !== 'undefined') {
            URL.revokeObjectURL(completed);
            completed = undefined;
        }
        let aidoku: any;
        if (file.name.endsWith(".aib")) { // new format
            aidoku = bplist.parseBuffer(Buffer.from(await file.arrayBuffer()))[0];
        } else { // old format
            aidoku = JSON.parse(await file.text());
        }
        let pb: { sourceMangas: any[], chapterMarkers: any[], library: any[] } = { sourceMangas: [], chapterMarkers: [], library: [] }
        for (const item of aidoku.library) {
            pb.library.push({ manga: { id: item.sourceId + '\0' + item.mangaId } });
        }
        for (const item of aidoku.manga) {
            if (typeof map[item.sourceId] === 'undefined') continue;
            pb.sourceMangas.push({
                sourceId: map[item.sourceId].id,
                mangaId: map[item.sourceId].manga(item.id),
                manga: {
                    id: item.sourceId + '\0' + item.id,
                    titles: [item.title],
                    author: item.author,
                    artist: item.artist,
                    image: item.cover
                }
            })
        }
        for (const item of aidoku.history) {
            if (typeof map[item.sourceId] === 'undefined') continue;
            let chapter = aidoku.chapters.find(chap => chap.id === item.chapterId && chap.mangaId === item.mangaId && chap.sourceId === item.sourceId);
            if (typeof chapter === 'undefined') continue;
            pb.chapterMarkers.push({
                chapter: {
                    mangaId: map[item.sourceId].manga(item.mangaId),
                    chapNum: chapter.chapter
                },
                lastPage: item.progress
            })
        }
        completed = URL.createObjectURL(new Blob([ JSON.stringify(pb, null, 2) ], { type: "application/json" }))
    }
</script>

<div style = "width: min(100%, 50rem); padding: 2rem; margin: 0 auto;">
<h1>Aidoku to PB</h1>
<p>
This tool is specifically for turning an Aidoku backup into a bare-bones paperback backup, only
containing the specific information that Soshiki needs to import it. This will only exist until 
proper Aidoku source support is added in the future. Do not try to import this backup into Paperback.
It will not work. This is only so you can load your Aidoku data into Soshiki.
<br/>
Currently only supports:<br/>
MangaDex<br/>
MangaNato<br/>
MangaSee<br/>
MangaPill<br/>
Readm
</p>


<input type="file" bind:files>

<br/><br/>
{#if typeof completed !== 'undefined'}
    <a href={completed} download="Aidoku_To_Paperback">Click to Download File</a>
{/if}

</div>

