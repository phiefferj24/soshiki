import { readFileSync, rmSync, readdirSync } from "fs"
import { spawnSync } from "child_process"
import { Database } from "."
import { Entry, MediaType } from "soshiki-types"
import { ImageMappers, MalSyncLink, VideoMappers, TextMappers } from "./maps"
import objectEquals from "deep-equal"
import { MUUID } from "uuid-mongodb"
import progress from "cli-progress"
import fetch from "node-fetch"

// update().then(() => {process.exit(0)})
individualUpdate().then(() => {process.exit(0)})

async function update() {
    const db = await Database.connect()

    const REPO_URL = "https://github.com/MALSync/MAL-Sync-Backup";

    console.log("Cloning repo");
    if (!readdirSync("./").includes("MAL-Sync-Backup")) {
        spawnSync("git", ["clone", REPO_URL]);
        console.log("Cloned repo");
    } else {
        console.log("Repo already cloned");
    }
    let textEntries: Entry[] = [];
    let imageEntries: Entry[] = [];
    let videoEntries: Entry[] = [];
    console.log("Reading directories");
    let malMangaFiles = JSON.parse(readFileSync("./MAL-Sync-Backup/data/myanimelist/manga/_index.json", "utf8"));
    let malAnimeFiles = JSON.parse(readFileSync("./MAL-Sync-Backup/data/myanimelist/anime/_index.json", "utf8"));
    let alMangaFiles = JSON.parse(readFileSync("./MAL-Sync-Backup/data/anilist/manga/_index.json", "utf8"));
    let alAnimeFiles = JSON.parse(readFileSync("./MAL-Sync-Backup/data/anilist/anime/_index.json", "utf8"));
    console.log("Read directories");
    console.log("Total MAL manga files: " + malMangaFiles.length);
    console.log("Total MAL anime files: " + malAnimeFiles.length);
    console.log("Total AL manga files: " + alMangaFiles.length);
    console.log("Total AL anime files: " + alAnimeFiles.length);
    const malAnimeInitialLength = malAnimeFiles.length
    const malMangaInitialLength = malMangaFiles.length
    let alAnimeFileCount = 0
    const alAnimeFileProgress =  new progress.SingleBar({
        clearOnComplete: false,
        hideCursor: true,
        format: "{type} | {bar} | {percentage}% | {value} of {total}"
    }, progress.Presets.rect)
    alAnimeFileProgress.start(alAnimeFiles.length, 0, { type: "AL Anime " })
    for (const alAnimeFile of alAnimeFiles) {
        const alData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/anilist/anime/${alAnimeFile}.json`, 'utf8'))
        const malFileIndex = malAnimeFiles.indexOf(alData.malId ?? -1)
        let malData: any
        if (malFileIndex >= 0) malData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/myanimelist/anime/${malAnimeFiles.splice(malFileIndex, 1)[0]}.json`, 'utf8'))
        const entry = createAnilistAnimeEntry(alData, malData)
        videoEntries.push(entry)
        alAnimeFileCount++
        alAnimeFileProgress.update(alAnimeFileCount)
    }
    alAnimeFileProgress.stop()
    let malAnimeFileCount = malAnimeInitialLength - malAnimeFiles.length
    const malAnimeFileProgress =  new progress.SingleBar({
        clearOnComplete: false,
        hideCursor: true,
        format: "{type} | {bar} | {percentage}% | {value} of {total}"
    }, progress.Presets.rect)
    malAnimeFileProgress.start(malAnimeInitialLength, malAnimeFileCount, { type: "MAL Anime" })
    for (const malAnimeFile of malAnimeFiles) {
        const malData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/myanimelist/anime/${malAnimeFile}.json`, 'utf8'))
        const entry = createMalAnimeEntry(malData)
        videoEntries.push(entry)
        malAnimeFileCount++
        malAnimeFileProgress.update(malAnimeFileCount)
    }
    malAnimeFileProgress.stop()
    let alMangaFileCount = 0
    const alMangaFileProgress =  new progress.SingleBar({
        clearOnComplete: false,
        hideCursor: true,
        format: "{type} | {bar} | {percentage}% | {value} of {total}"
    }, progress.Presets.rect)
    alMangaFileProgress.start(alMangaFiles.length, 0, { type: "AL Manga " })
    for (const alMangaFile of alMangaFiles) {
        const alData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/anilist/manga/${alMangaFile}.json`, 'utf8'))
        const malFileIndex = malMangaFiles.indexOf(alData.malId ?? -1)
        let malData: any
        if (malFileIndex >= 0) malData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/myanimelist/manga/${malMangaFiles.splice(malFileIndex, 1)[0]}.json`, 'utf8'))
        const isNovel = alData.category === 'novel' || malData?.category === 'Light Novel'
        const entry = createAnilistMangaEntry(alData, malData, isNovel)
        if (isNovel) textEntries.push(entry)
        else imageEntries.push(entry)
        alMangaFileCount++
        alMangaFileProgress.update(alMangaFileCount)
    }
    alMangaFileProgress.stop()
    let malMangaFileCount = malMangaInitialLength - malMangaFiles.length
    const malMangaFileProgress =  new progress.SingleBar({
        clearOnComplete: false,
        hideCursor: true,
        format: "{type} | {bar} | {percentage}% | {value} of {total}"
    }, progress.Presets.rect)
    malMangaFileProgress.start(malMangaInitialLength, malMangaFileCount, { type: "MAL Manga" })
    for (const malMangaFile of malMangaFiles) {
        if (malMangaFile === '_index.json') return
        const malData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/myanimelist/manga/${malMangaFile}.json`, 'utf8'))
        const isNovel = malData.category === 'Light Novel'
        const entry = createMalMangaEntry(malData, isNovel)
        if (isNovel) textEntries.push(entry)
        else imageEntries.push(entry)
        malMangaFileCount++
        malMangaFileProgress.update(malMangaFileCount)
    }
    malMangaFileProgress.stop()

    console.log("Fetching anime-lists links...")
    const animeLinks = await fetch('https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json').then(res => res.json())
    const animeLinksProgress =  new progress.SingleBar({
        clearOnComplete: false,
        hideCursor: true,
        format: "{type} | {bar} | {percentage}% | {value} of {total}"
    }, progress.Presets.rect)
    animeLinksProgress.start(animeLinks.length, 0, { type: "anime-lists Entries" })
    let animeLinksCount = 0
    let unfoundLinksPromises: Promise<void>[] = []
    const unfoundLinksProgress =  new progress.SingleBar({
        clearOnComplete: false,
        hideCursor: true,
        format: "{type} | {bar} | {percentage}% | {value} of {total}"
    }, progress.Presets.rect)
    let unfoundLinksCount = 0
    for (const link of animeLinks) {
        let trackers: Entry.Tracker[] = []
        if ("mal_id" in link) {
            trackers.push({ name: "MyAnimeList", id: "myanimelist", entryId: `${link.mal_id}` })
        }
        if ("anilist_id" in link) {
            trackers.push({ name: "AniList", id: "anilist", entryId: `${link.anilist_id}` })
        }
        let entryIndex = videoEntries.findIndex(entry => {
            return entry.trackers.some(tracker => trackers.findIndex(tracker2 => tracker2.entryId === tracker.entryId && tracker2.name === tracker.name && tracker2.id === tracker.id) !== -1)
        })
        if (entryIndex !== -1) {
            let entry = videoEntries[entryIndex]
            for (const item of Object.entries(link)) {
                switch (item[0]) {
                    case "livechart_id": if (entry.trackers.findIndex(t => t.id === "livechart") === -1) entry.trackers.push({ name: "LiveChart", id: "livechart", entryId: `${item[1]}` }); break
                    case "anime-planet_id": if (entry.trackers.findIndex(t => t.id === "anime-planet") === -1) entry.trackers.push({ name: "Anime-Planet", id: "anime-planet", entryId: `${item[1]}` }); break
                    case "anisearch_id": if (entry.trackers.findIndex(t => t.id === "anisearch") === -1) entry.trackers.push({ name: "aniSearch", id: "anisearch", entryId: `${item[1]}` }); break
                    case "anidb_id": if (entry.trackers.findIndex(t => t.id === "anidb") === -1) entry.trackers.push({ name: "AniDB", id: "anidb", entryId: `${item[1]}` }); break
                    case "kitsu_id": if (entry.trackers.findIndex(t => t.id === "kitsu") === -1) entry.trackers.push({ name: "Kitsu", id: "kitsu", entryId: `${item[1]}` }); break
                    case "notify.moe_id": if (entry.trackers.findIndex(t => t.id === "notify.moe") === -1) entry.trackers.push({ name: "Notify.moe", id: "notify.moe", entryId: `${item[1]}` }); break
                    case "thetvdb_id": if (entry.trackers.findIndex(t => t.id === "thetvdb") === -1) entry.trackers.push({ name: "TheTVDB", id: "thetvdb", entryId: `${item[1]}` }); break
                    case "imdb_id": if (entry.trackers.findIndex(t => t.id === "imdb") === -1) entry.trackers.push({ name: "IMDb", id: "imdb", entryId: `${item[1]}` }); break
                    case "themoviedb_id": if (entry.trackers.findIndex(t => t.id === "tmdb") === -1) entry.trackers.push({ name: "TMDB", id: "tmdb", entryId: `${item[1]}` }); break
                }
            }
            videoEntries[entryIndex] = entry
        // } else if ("kitsu_id" in link) {
        //     unfoundLinksPromises.push((async () => {
        //         let entry = await getKitsuEntry(link.kitsu_id).catch(() => null)
        //         if (entry === null) return
        //         for (const item of Object.entries(link)) {
        //             switch (item[0]) {
        //                 case "livechart_id": if (entry.trackers.findIndex(t => t.id === "livechart") === -1) entry.trackers.push({ name: "LiveChart", id: "livechart", entryId: `${item[1]}` }); break
        //                 case "anime-planet_id": if (entry.trackers.findIndex(t => t.id === "anime-planet") === -1) entry.trackers.push({ name: "Anime-Planet", id: "anime-planet", entryId: `${item[1]}` }); break
        //                 case "anisearch_id": if (entry.trackers.findIndex(t => t.id === "anisearch") === -1) entry.trackers.push({ name: "aniSearch", id: "anisearch", entryId: `${item[1]}` }); break
        //                 case "anidb_id": if (entry.trackers.findIndex(t => t.id === "anidb") === -1) entry.trackers.push({ name: "AniDB", id: "anidb", entryId: `${item[1]}` }); break
        //                 case "notify.moe_id": if (entry.trackers.findIndex(t => t.id === "notify.moe") === -1) entry.trackers.push({ name: "Notify.moe", id: "notify.moe", entryId: `${item[1]}` }); break
        //                 case "thetvdb_id": if (entry.trackers.findIndex(t => t.id === "thetvdb") === -1) entry.trackers.push({ name: "TheTVDB", id: "thetvdb", entryId: `${item[1]}` }); break
        //                 case "imdb_id": if (entry.trackers.findIndex(t => t.id === "imdb") === -1) entry.trackers.push({ name: "IMDb", id: "imdb", entryId: `${item[1]}` }); break
        //                 case "themoviedb_id": if (entry.trackers.findIndex(t => t.id === "tmdb") === -1) entry.trackers.push({ name: "TMDB", id: "tmdb", entryId: `${item[1]}` }); break
        //                 case "mal_id": if (entry.trackers.findIndex(t => t.id === "myanimelist") === -1) entry.trackers.push({ name: "MyAnimeList", id: "myanimelist", entryId: `${item[1]}` }); break
        //                 case "anilist_id": if (entry.trackers.findIndex(t => t.id === "anilist") === -1) entry.trackers.push({ name: "AniList", id: "anilist", entryId: `${item[1]}` }); break
        //             }
        //         }
        //         videoEntries.push(entry)
        //         unfoundLinksCount++
        //         unfoundLinksProgress.update(unfoundLinksCount)
        //     })())
        }
        animeLinksCount++
        animeLinksProgress.update(animeLinksCount)
    }
    animeLinksProgress.stop()
    // console.log(`${unfoundLinksPromises.length} not found from MAL-sync, updating from their respective sources...`)
    // unfoundLinksProgress.start(unfoundLinksPromises.length, unfoundLinksCount, { type: "Unfound Entries" })
    // for (let index = 0; index < unfoundLinksPromises.length; index += 25) {
    //     await Promise.all(unfoundLinksPromises.slice(index, Math.min(index + 25, unfoundLinksPromises.length)))
    // }
    // unfoundLinksProgress.stop()
    console.log(`Totals:\n\t${textEntries.length} text entries\n\t${imageEntries.length} image entries\n\t${videoEntries.length} video entries`)
    console.log("Updating entries in database...")
    let newTextEntryCount = 0
    let newImageEntryCount = 0
    let newVideoEntryCount = 0
    const dbProgress = new progress.MultiBar({
        clearOnComplete: false,
        hideCursor: true, 
        format: "{type} | {bar} | {percentage}% | {value} of {total}"
    }, progress.Presets.rect)
    const textDbProgress = dbProgress.create(textEntries.length, 0, { type: "Text " })
    const imageDbProgress = dbProgress.create(imageEntries.length, 0, { type: "Image" })
    const videoDbProgress = dbProgress.create(videoEntries.length, 0, { type: "Video" })
    await Promise.all([
        ...textEntries.map(entry => (async () => {
            const dbEntry = await db.getDatabaseEntry({
                $or: entry.trackers.map(tracker => ({ trackers: tracker }))
            }, MediaType.TEXT) as Entry & { _id?: MUUID } | null
            if (dbEntry === null) {
                await db.addDatabaseEntry(MediaType.TEXT, entry)
                newTextEntryCount++
            } else {
                delete dbEntry._id
                if (!objectEquals(entry, dbEntry, {strict: true})) {
                    await db.setDatabaseEntryByQuery(MediaType.TEXT, {
                        $or: entry.trackers.map(tracker => ({ trackers: tracker }))
                    }, entry)
                }
            }
            textDbProgress.increment()
        })()),
        ...imageEntries.map(entry => (async () => {
            const dbEntry = await db.getDatabaseEntry({
                $or: entry.trackers.map(tracker => ({ trackers: tracker }))
            }, MediaType.IMAGE) as Entry & { _id?: MUUID } | null
            if (dbEntry === null) {
                await db.addDatabaseEntry(MediaType.IMAGE, entry)
                newImageEntryCount++
            } else {
                delete dbEntry._id
                if (!objectEquals(entry, dbEntry, {strict: true})) {
                    await db.setDatabaseEntryByQuery(MediaType.IMAGE, {
                        $or: entry.trackers.map(tracker => ({ trackers: tracker }))
                    }, entry)
                }
            }
            imageDbProgress.increment()
        })()),
        ...videoEntries.map(entry => (async () => {
            let dbEntry = await db.getDatabaseEntry({
                $or: entry.trackers.map(tracker => ({ trackers: tracker }))
            }, MediaType.VIDEO) as Entry & { _id?: MUUID } | null
            if (dbEntry === null) {
                await db.addDatabaseEntry(MediaType.VIDEO, entry)
                newVideoEntryCount++
            } else {
                delete dbEntry._id
                if (!objectEquals(entry, dbEntry, {strict: true})) {
                    await db.setDatabaseEntryByQuery(MediaType.VIDEO, {
                        $or: entry.trackers.map(tracker => ({ trackers: tracker }))
                    }, entry)
                }
            }
            videoDbProgress.increment()
        })())
    ])
    dbProgress.stop()
    console.log(`Totals:\n\tNew text entries: ${newTextEntryCount}\n\tNew image entries: ${newImageEntryCount}\n\tNew video entries: ${newVideoEntryCount}`)
    console.log("Cleaning up...");
    // rmSync(`./MAL-Sync-Backup`, {recursive: true});
    console.log("Done cleaning up.");
    process.exit(0);
}

async function getKitsuEntry(id: string): Promise<Entry | null> {
    const data = await fetch(`https://kitsu.io/api/edge/anime/${id}`).then(res => res.json()).catch((e) => {console.error(e); return {}})
    if (!('data' in data)) return null
    return {
        mediaType: MediaType.VIDEO,
        title: data.data.attributes.canonicalTitle,
        alternativeTitles: Object.values(data.data.attributes.titles ?? {}) + (data.data.attributes.abbreviatedTitles ?? []),
        staff: [],
        covers: Object.entries(data.data.attributes.posterImage ?? {}).map(cover => {
            switch (cover[0]) {
                case "tiny": return { image: cover[1], quality: Entry.ImageQuality.LOW } as Entry.Image
                case "small": return { image: cover[1], quality: Entry.ImageQuality.LOW } as Entry.Image
                case "medium": return { image: cover[1], quality: Entry.ImageQuality.MEDIUM } as Entry.Image
                case "large": return { image: cover[1], quality: Entry.ImageQuality.HIGH } as Entry.Image
                case "original": return { image: cover[1], quality: Entry.ImageQuality.FULL } as Entry.Image
                default: return { image: cover[1], quality: Entry.ImageQuality.UNKNOWN } as Entry.Image
            }
        }),
        banners: Object.entries(data.data.attributes.coverImage ?? {}).map(cover => {
            switch (cover[0]) {
                case "tiny": return { image: cover[1], quality: Entry.ImageQuality.LOW } as Entry.Image
                case "small": return { image: cover[1], quality: Entry.ImageQuality.LOW } as Entry.Image
                case "medium": return { image: cover[1], quality: Entry.ImageQuality.MEDIUM } as Entry.Image
                case "large": return { image: cover[1], quality: Entry.ImageQuality.HIGH } as Entry.Image
                case "original": return { image: cover[1], quality: Entry.ImageQuality.FULL } as Entry.Image
                default: return { image: cover[1], quality: Entry.ImageQuality.UNKNOWN } as Entry.Image
            }
        }),
        contentRating: data.data.attributes.ageRating === "R18" ? Entry.ContentRating.NSFW : data.data.attributes.ageRating === "R" ? Entry.ContentRating.SUGGESTIVE : Entry.ContentRating.SAFE,
        status: data.data.attributes.status === "current" ? Entry.Status.RELEASING : data.data.attributes.status === "finished" ? Entry.Status.COMPLETED : (data.data.attributes.status === "unreleased" || data.data.attributes.status === "upcoming") ? Entry.Status.UNRELEASED : Entry.Status.UNKNOWN,
        tags: [],
        links: [],
        platforms: [],
        trackers: [{ name: "Kitsu", id: "kitsu", entryId: id }]
    }
}

function createAnilistAnimeEntry(alData: any, malData: any | undefined): Entry {
    let entry: Entry = {
        mediaType: MediaType.VIDEO,
        title: alData.title ?? malData?.title ?? "",
        alternativeTitles: alData.altTitle.map((title: string) => ({ title } as Entry.AlternativeTitle)),
        staff: [],
        covers: [{ image: alData.image, quality: Entry.ImageQuality.UNKNOWN }, ...(typeof malData?.image !== 'undefined' ? [{ image: malData.image, quality: Entry.ImageQuality.UNKNOWN }] : [])],
        banners: [],
        contentRating: (alData.hentai ?? malData?.hentai ?? false) ? Entry.ContentRating.NSFW : Entry.ContentRating.SAFE,
        status: Entry.Status.UNKNOWN,
        tags: [],
        links: [{ site: "AniList", url: alData.url }, ...(alData.externalLinks as Entry.Link[] ?? [])],
        platforms: [{
            name: "Soshiki",
            id: "soshiki",
            sources: []
        }],
        trackers: [
            {
                name: "AniList",
                id: "anilist",
                entryId: `${alData.id}`
            },
            ...(
                typeof malData?.id !== 'undefined' ? [{
                    name: "MyAnimeList",
                    id: "myanimelist",
                    entryId: `${malData.id}`
                }] : []
            )
        ]
    }
    if (typeof malData?.altTitle !== 'undefined') {
        entry.alternativeTitles.push(...(malData.altTitle.filter((title: string) => entry.alternativeTitles.findIndex(item => item.title === title) === -1).map((title: string) => ({ title } as Entry.AlternativeTitle))))
    }
    if (typeof malData?.url !== 'undefined') {
        entry.links.push({ site: "MyAnimeList", url: malData.url })
    }
    if (typeof malData?.externalLinks !== 'undefined') {
        entry.links.push(...(malData.externalLinks.filter((title: Entry.Link) => entry.links.findIndex(item => item.site.toLowerCase() === title.site.toLowerCase()) === -1) as Entry.Link[]))
    }
    if (typeof malData?.legalLinks !== 'undefined') {
        entry.links.push(...(malData.legalLinks.filter((title: Entry.Link) => entry.links.findIndex(item => item.site.toLowerCase() === title.site.toLowerCase()) === -1) as Entry.Link[]))
    }
    for (const source of Object.entries(alData.Pages ?? {})) {
        for (const sourceEntry of Object.entries(source[1] as any)) {
            const mapped = VideoMappers[source[0].toLowerCase()]?.(sourceEntry[1] as MalSyncLink) ?? null
            if (mapped !== null) entry.platforms.find(platform => platform.id === 'soshiki')?.sources.push(mapped)
        }
    }
    for (const source of Object.entries(malData?.Pages ?? {})) {
        for (const sourceEntry of Object.entries(source[1] as any)) {
            const mapped = VideoMappers[source[0].toLowerCase()]?.(sourceEntry[1] as MalSyncLink) ?? null
            if (mapped !== null && entry.platforms.find(platform => platform.id === 'soshiki')!.sources.findIndex(item => item.entryId === mapped.entryId) === -1) entry.platforms.find(platform => platform.id === 'soshiki')?.sources.push(mapped)
        }
    }
    return entry
}

function createMalAnimeEntry(malData: any): Entry {
    let entry: Entry = {
        mediaType: MediaType.VIDEO,
        title: malData.title ?? "",
        alternativeTitles: malData.altTitle.map((title: string) => ({ title } as Entry.AlternativeTitle)),
        staff: [],
        covers: [{ image: malData.image, quality: Entry.ImageQuality.UNKNOWN }],
        banners: [],
        contentRating: (malData.hentai ?? false) ? Entry.ContentRating.NSFW : Entry.ContentRating.SAFE,
        status: Entry.Status.UNKNOWN,
        tags: [],
        links: [{ site: "MyAnimeList", url: malData.url }, ...(malData.externalLinks as Entry.Link[] ?? []), ...(malData.legalLinks as Entry.Link[] ?? [])],
        platforms: [{
            name: "Soshiki",
            id: "soshiki",
            sources: []
        }],
        trackers: [
            {
                name: "MyAnimeList",
                id: "myanimelist",
                entryId: `${malData.id}`
            }
        ]
    }
    for (const source of Object.entries(malData.Pages ?? {})) {
        for (const sourceEntry of Object.entries(source[1] as any)) {
            const mapped = VideoMappers[source[0].toLowerCase()]?.(sourceEntry[1] as MalSyncLink) ?? null
            if (mapped !== null) entry.platforms.find(platform => platform.id === 'soshiki')?.sources.push(mapped)
        }
    }
    return entry
}

function createAnilistMangaEntry(alData: any, malData: any | undefined, isNovel: boolean) {
    let entry: Entry = {
        mediaType: isNovel ? MediaType.TEXT : MediaType.IMAGE,
        title: alData.title ?? malData?.title ?? "",
        alternativeTitles: alData.altTitle.map((title: string) => ({ title } as Entry.AlternativeTitle)),
        staff: alData.authors.map((author: string) => ({ name: author, role: 'author' } as Entry.Staff)),
        covers: [{ image: alData.image, quality: Entry.ImageQuality.UNKNOWN }, ...(typeof malData?.image !== 'undefined' ? [{ image: malData.image, quality: Entry.ImageQuality.UNKNOWN }] : [])],
        banners: [],
        contentRating: (alData.hentai ?? malData?.hentai ?? false) ? Entry.ContentRating.NSFW : Entry.ContentRating.SAFE,
        status: Entry.Status.UNKNOWN,
        tags: [],
        links: [{ site: "AniList", url: alData.url }, ...(alData.externalLinks as Entry.Link[] ?? [])],
        platforms: [{
            name: "Soshiki",
            id: "soshiki",
            sources: []
        }],
        trackers: [
            {
                name: "AniList",
                id: "anilist",
                entryId: `${alData.id}`
            },
            ...(
                typeof malData?.id !== 'undefined' ? [{
                    name: "MyAnimeList",
                    id: "myanimelist",
                    entryId: `${malData.id}`
                }] : []
            )
        ]
    }
    if (typeof malData?.altTitle !== 'undefined') {
        entry.alternativeTitles.push(...(malData.altTitle.filter((title: string) => entry.alternativeTitles.findIndex(item => item.title === title) === -1).map((title: string) => ({ title } as Entry.AlternativeTitle))))
    }
    if (typeof malData?.url !== 'undefined') {
        entry.links.push({ site: "MyAnimeList", url: malData.url })
    }
    if (typeof malData?.externalLinks !== 'undefined') {
        entry.links.push(...(malData.externalLinks.filter((title: Entry.Link) => entry.links.findIndex(item => item.site.toLowerCase() === title.site.toLowerCase()) === -1) as Entry.Link[]))
    }
    if (typeof malData?.legalLinks !== 'undefined') {
        entry.links.push(...(malData.legalLinks.filter((title: Entry.Link) => entry.links.findIndex(item => item.site.toLowerCase() === title.site.toLowerCase()) === -1) as Entry.Link[]))
    }
    if (typeof malData?.authors !== 'undefined') {
        entry.staff.push(...malData.authors.filter((author: string) => entry.staff.findIndex(item => item.name.toLowerCase() === author.toLowerCase()) === -1).map((author: string) => ({ name: author, role: 'author' } as Entry.Staff)))
    }
    for (const source of Object.entries(alData.Pages ?? {})) {
        for (const sourceEntry of Object.entries(source[1] as any)) {
            const mapped = isNovel ? TextMappers[source[0].toLowerCase()]?.(sourceEntry[1] as MalSyncLink) ?? null : ImageMappers[source[0].toLowerCase()]?.(sourceEntry[1] as MalSyncLink) ?? null
            if (mapped !== null) entry.platforms.find(platform => platform.id === 'soshiki')?.sources.push(mapped)
        }
    }
    for (const source of Object.entries(malData?.Pages ?? {})) {
        for (const sourceEntry of Object.entries(source[1] as any)) {
            const mapped = isNovel ? TextMappers[source[0].toLowerCase()]?.(sourceEntry[1] as MalSyncLink) ?? null : ImageMappers[source[0].toLowerCase()]?.(sourceEntry[1] as MalSyncLink) ?? null
            if (mapped !== null && entry.platforms.find(platform => platform.id === 'soshiki')!.sources.findIndex(item => item.entryId === mapped.entryId) === -1) entry.platforms.find(platform => platform.id === 'soshiki')?.sources.push(mapped)
        }
    }
    return entry
}

function createMalMangaEntry(malData: any, isNovel: boolean) {
    let entry: Entry = {
        mediaType: isNovel ? MediaType.TEXT : MediaType.IMAGE,
        title: malData.title ??  "",
        alternativeTitles: malData.altTitle.map((title: string) => ({ title } as Entry.AlternativeTitle)),
        staff: malData.authors.map((author: string) => ({ name: author, role: 'author' } as Entry.Staff)),
        covers: [{ image: malData.image, quality: Entry.ImageQuality.UNKNOWN }],
        banners: [],
        contentRating: (malData.hentai ?? false) ? Entry.ContentRating.NSFW : Entry.ContentRating.SAFE,
        status: Entry.Status.UNKNOWN,
        tags: [],
        links: [{ site: "MyAnimeList", url: malData.url }, ...(malData.externalLinks as Entry.Link[] ?? []), ...(malData.legalLinks as Entry.Link[] ?? [])],
        platforms: [{
            name: "Soshiki",
            id: "soshiki",
            sources: []
        }],
        trackers: [
            {
                name: "MyAnimeList",
                id: "myanimelist",
                entryId: `${malData.id}`
            }
        ]
    }
    for (const source of Object.entries(malData.Pages ?? {})) {
        for (const sourceEntry of Object.entries(source[1] as any)) {
            const mapped = isNovel ? TextMappers[source[0].toLowerCase()]?.(sourceEntry[1] as MalSyncLink) ?? null : ImageMappers[source[0].toLowerCase()]?.(sourceEntry[1] as MalSyncLink) ?? null
            if (mapped !== null) entry.platforms.find(platform => platform.id === 'soshiki')?.sources.push(mapped)
        }
    }
    return entry
}

async function individualUpdate() {
    const db = await Database.connect()

    const REPO_URL = "https://github.com/MALSync/MAL-Sync-Backup";

    console.log("Cloning repo");
    if (!readdirSync("./").includes("MAL-Sync-Backup")) {
        spawnSync("git", ["clone", REPO_URL]);
        console.log("Cloned repo");
    } else {
        console.log("Repo already cloned");
    }
    console.log("Reading directories");
    let malMangaFiles = JSON.parse(readFileSync("./MAL-Sync-Backup/data/myanimelist/manga/_index.json", "utf8"));
    let malAnimeFiles = JSON.parse(readFileSync("./MAL-Sync-Backup/data/myanimelist/anime/_index.json", "utf8"));
    let alMangaFiles = JSON.parse(readFileSync("./MAL-Sync-Backup/data/anilist/manga/_index.json", "utf8"));
    let alAnimeFiles = JSON.parse(readFileSync("./MAL-Sync-Backup/data/anilist/anime/_index.json", "utf8"));
    console.log("Read directories");
    console.log("Fetching anime-lists links...")
    const animeLinks = await fetch('https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json').then(res => res.json())
    console.log("Total MAL manga files: " + malMangaFiles.length);
    console.log("Total MAL anime files: " + malAnimeFiles.length);
    console.log("Total AL manga files: " + alMangaFiles.length);
    console.log("Total AL anime files: " + alAnimeFiles.length);
    const malAnimeInitialLength = malAnimeFiles.length
    const malMangaInitialLength = malMangaFiles.length
    let textEntryCount = 0
    let imageEntryCount = 0
    let videoEntryCount = 0
    let newTextEntryCount = 0
    let newImageEntryCount = 0
    let newVideoEntryCount = 0
    let alAnimeFileCount = 0
    const alAnimeFileProgress =  new progress.SingleBar({
        clearOnComplete: false,
        hideCursor: true,
        format: "{type} | {bar} | {percentage}% | {value} of {total}"
    }, progress.Presets.rect)
    alAnimeFileProgress.start(alAnimeFiles.length, 0, { type: "AL Anime " })
    await Promise.all(alAnimeFiles.map((alAnimeFile: any) => (async () => {
        const alData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/anilist/anime/${alAnimeFile}.json`, 'utf8'))
        const malFileIndex = malAnimeFiles.indexOf(alData.malId ?? -1)
        let malData: any
        if (malFileIndex >= 0) malData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/myanimelist/anime/${malAnimeFiles.splice(malFileIndex, 1)[0]}.json`, 'utf8'))
        let entry = createAnilistAnimeEntry(alData, malData)
        const link = animeLinks.find((link: any) => `${link.anilist_id}` === `${alData.id}` || (malData?.id !== undefined && `${malData?.id}` === `${link.mal_id}`))
        if (typeof link !== 'undefined') {
            for (const item of Object.entries(link)) {
                switch (item[0]) {
                    case "livechart_id": entry.trackers.push({ name: "LiveChart", id: "livechart", entryId: `${item[1]}` }); break
                    case "anime-planet_id": entry.trackers.push({ name: "Anime-Planet", id: "anime-planet", entryId: `${item[1]}` }); break
                    case "anisearch_id": entry.trackers.push({ name: "aniSearch", id: "anisearch", entryId: `${item[1]}` }); break
                    case "anidb_id": entry.trackers.push({ name: "AniDB", id: "anidb", entryId: `${item[1]}` }); break
                    case "kitsu_id": entry.trackers.push({ name: "Kitsu", id: "kitsu", entryId: `${item[1]}` }); break
                    case "notify.moe_id": entry.trackers.push({ name: "Notify.moe", id: "notify.moe", entryId: `${item[1]}` }); break
                    case "thetvdb_id": entry.trackers.push({ name: "TheTVDB", id: "thetvdb", entryId: `${item[1]}` }); break
                    case "imdb_id": entry.trackers.push({ name: "IMDb", id: "imdb", entryId: `${item[1]}` }); break
                    case "themoviedb_id": entry.trackers.push({ name: "TMDB", id: "tmdb", entryId: `${item[1]}` }); break
                }
            }
        }
        let dbEntry = await db.getDatabaseEntry({
            $or: entry.trackers.map(tracker => ({ trackers: tracker }))
        }, MediaType.VIDEO) as Entry & { _id?: MUUID } | null
        if (dbEntry === null) {
            await db.addDatabaseEntry(MediaType.VIDEO, entry)
            newVideoEntryCount++
        } else {
            delete dbEntry._id
            if (!objectEquals(entry, dbEntry, {strict: true})) {
                await db.setDatabaseEntryByQuery(MediaType.VIDEO, {
                    $or: entry.trackers.map(tracker => ({ trackers: tracker }))
                }, entry)
            }
        }
        videoEntryCount++
        alAnimeFileCount++
        alAnimeFileProgress.update(alAnimeFileCount)
    })()))
    alAnimeFileProgress.stop()
    let malAnimeFileCount = malAnimeInitialLength - malAnimeFiles.length
    const malAnimeFileProgress =  new progress.SingleBar({
        clearOnComplete: false,
        hideCursor: true,
        format: "{type} | {bar} | {percentage}% | {value} of {total}"
    }, progress.Presets.rect)
    malAnimeFileProgress.start(malAnimeInitialLength, malAnimeFileCount, { type: "MAL Anime" })
    await Promise.all(malAnimeFiles.map((malAnimeFile: any) => (async () => {
        const malData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/myanimelist/anime/${malAnimeFile}.json`, 'utf8'))
        let entry = createMalAnimeEntry(malData)
        const link = animeLinks.find((link: any) => `${link.mal_id}` === `${malData.id}`)
        if (typeof link !== 'undefined') {
            for (const item of Object.entries(link)) {
                switch (item[0]) {
                    case "livechart_id": entry.trackers.push({ name: "LiveChart", id: "livechart", entryId: `${item[1]}` }); break
                    case "anime-planet_id": entry.trackers.push({ name: "Anime-Planet", id: "anime-planet", entryId: `${item[1]}` }); break
                    case "anisearch_id": entry.trackers.push({ name: "aniSearch", id: "anisearch", entryId: `${item[1]}` }); break
                    case "anidb_id": entry.trackers.push({ name: "AniDB", id: "anidb", entryId: `${item[1]}` }); break
                    case "kitsu_id": entry.trackers.push({ name: "Kitsu", id: "kitsu", entryId: `${item[1]}` }); break
                    case "notify.moe_id": entry.trackers.push({ name: "Notify.moe", id: "notify.moe", entryId: `${item[1]}` }); break
                    case "thetvdb_id": entry.trackers.push({ name: "TheTVDB", id: "thetvdb", entryId: `${item[1]}` }); break
                    case "imdb_id": entry.trackers.push({ name: "IMDb", id: "imdb", entryId: `${item[1]}` }); break
                    case "themoviedb_id": entry.trackers.push({ name: "TMDB", id: "tmdb", entryId: `${item[1]}` }); break
                }
            }
        }
        let dbEntry = await db.getDatabaseEntry({
            $or: entry.trackers.map(tracker => ({ trackers: tracker }))
        }, MediaType.VIDEO) as Entry & { _id?: MUUID } | null
        if (dbEntry === null) {
            await db.addDatabaseEntry(MediaType.VIDEO, entry)
            newVideoEntryCount++
        } else {
            delete dbEntry._id
            if (!objectEquals(entry, dbEntry, {strict: true})) {
                await db.setDatabaseEntryByQuery(MediaType.VIDEO, {
                    $or: entry.trackers.map(tracker => ({ trackers: tracker }))
                }, entry)
            }
        }
        videoEntryCount++
        malAnimeFileCount++
        malAnimeFileProgress.update(malAnimeFileCount)
    })()))
    malAnimeFileProgress.stop()
    let alMangaFileCount = 0
    const alMangaFileProgress =  new progress.SingleBar({
        clearOnComplete: false,
        hideCursor: true,
        format: "{type} | {bar} | {percentage}% | {value} of {total}"
    }, progress.Presets.rect)
    alMangaFileProgress.start(alMangaFiles.length, 0, { type: "AL Manga " })
    await Promise.all(alMangaFiles.map((alMangaFile: any) => (async () => {
        const alData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/anilist/manga/${alMangaFile}.json`, 'utf8'))
        const malFileIndex = malMangaFiles.indexOf(alData.malId ?? -1)
        let malData: any
        if (malFileIndex >= 0) malData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/myanimelist/manga/${malMangaFiles.splice(malFileIndex, 1)[0]}.json`, 'utf8'))
        const isNovel = alData.category === 'novel' || malData?.category === 'Light Novel'
        const entry = createAnilistMangaEntry(alData, malData, isNovel)
        if (isNovel) {
            const dbEntry = await db.getDatabaseEntry({
                $or: entry.trackers.map(tracker => ({ trackers: tracker }))
            }, MediaType.TEXT) as Entry & { _id?: MUUID } | null
            if (dbEntry === null) {
                await db.addDatabaseEntry(MediaType.TEXT, entry)
                newTextEntryCount++
            } else {
                delete dbEntry._id
                if (!objectEquals(entry, dbEntry, {strict: true})) {
                    await db.setDatabaseEntryByQuery(MediaType.TEXT, {
                        $or: entry.trackers.map(tracker => ({ trackers: tracker }))
                    }, entry)
                }
            }
            textEntryCount++
        } else {
            const dbEntry = await db.getDatabaseEntry({
                $or: entry.trackers.map(tracker => ({ trackers: tracker }))
            }, MediaType.IMAGE) as Entry & { _id?: MUUID } | null
            if (dbEntry === null) {
                await db.addDatabaseEntry(MediaType.IMAGE, entry)
                newImageEntryCount++
            } else {
                delete dbEntry._id
                if (!objectEquals(entry, dbEntry, {strict: true})) {
                    await db.setDatabaseEntryByQuery(MediaType.IMAGE, {
                        $or: entry.trackers.map(tracker => ({ trackers: tracker }))
                    }, entry)
                }
            }
            imageEntryCount++
        }
        alMangaFileCount++
        alMangaFileProgress.update(alMangaFileCount)
    })()))
    alMangaFileProgress.stop()
    let malMangaFileCount = malMangaInitialLength - malMangaFiles.length
    const malMangaFileProgress =  new progress.SingleBar({
        clearOnComplete: false,
        hideCursor: true,
        format: "{type} | {bar} | {percentage}% | {value} of {total}"
    }, progress.Presets.rect)
    malMangaFileProgress.start(malMangaInitialLength, malMangaFileCount, { type: "MAL Manga" })
    await Promise.all(malMangaFiles.map((malMangaFile: any) => (async () => {
        if (malMangaFile === '_index.json') return
        const malData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/myanimelist/manga/${malMangaFile}.json`, 'utf8'))
        const isNovel = malData.category === 'Light Novel'
        const entry = createMalMangaEntry(malData, isNovel)
        if (isNovel) {
            const dbEntry = await db.getDatabaseEntry({
                $or: entry.trackers.map(tracker => ({ trackers: tracker }))
            }, MediaType.TEXT) as Entry & { _id?: MUUID } | null
            if (dbEntry === null) {
                await db.addDatabaseEntry(MediaType.TEXT, entry)
                newTextEntryCount++
            } else {
                delete dbEntry._id
                if (!objectEquals(entry, dbEntry, {strict: true})) {
                    await db.setDatabaseEntryByQuery(MediaType.TEXT, {
                        $or: entry.trackers.map(tracker => ({ trackers: tracker }))
                    }, entry)
                }
            }
            textEntryCount++
        } else {
            const dbEntry = await db.getDatabaseEntry({
                $or: entry.trackers.map(tracker => ({ trackers: tracker }))
            }, MediaType.IMAGE) as Entry & { _id?: MUUID } | null
            if (dbEntry === null) {
                await db.addDatabaseEntry(MediaType.IMAGE, entry)
                newImageEntryCount++
            } else {
                delete dbEntry._id
                if (!objectEquals(entry, dbEntry, {strict: true})) {
                    await db.setDatabaseEntryByQuery(MediaType.IMAGE, {
                        $or: entry.trackers.map(tracker => ({ trackers: tracker }))
                    }, entry)
                }
            }
            imageEntryCount++
        }
        malMangaFileCount++
        malMangaFileProgress.update(malMangaFileCount)
    })()))
    malMangaFileProgress.stop()
    console.log(`Totals:\n\t${textEntryCount} text entries (${newTextEntryCount} new)\n\t${imageEntryCount} image entries (${newImageEntryCount} new)\n\t${videoEntryCount} video entries (${newVideoEntryCount} new)`)
    console.log("Cleaning up...");
    // rmSync(`./MAL-Sync-Backup`, {recursive: true});
    console.log("Done cleaning up.");
    process.exit(0);
}