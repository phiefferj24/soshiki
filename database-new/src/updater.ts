import { readFileSync, rmSync, readdirSync, writeFileSync } from "fs"
import { spawnSync } from "child_process"
import { Database, DatabaseEntry } from "."
import { Entry, MediaType } from "soshiki-types"
import { ImageMappers, MalSyncLink, VideoMappers, TextMappers } from "./maps"
import objectEquals from "deep-equal"
import { MUUID } from "uuid-mongodb"
import progress from "cli-progress"
import fetch from "node-fetch"

update().then(() => {process.exit(0)})
// individualUpdate().then(() => {process.exit(0)})

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
    console.log(`Fetching anime-skip data...`)
    const animeSkipTotal = await fetch("https://api.anime-skip.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Client-Id": process.env.ANIME_SKIP_CLIENT_ID!
        },
        body: JSON.stringify({ query: `query { counts { shows } }`})
    }).then(res => res.json()).then(json => json.data.counts.shows)
    const animeSkipProgress =  new progress.SingleBar({
        clearOnComplete: false,
        hideCursor: true,
        format: "{type} | {bar} | {percentage}% | {value} of {total}"
    }, progress.Presets.rect)
    //animeSkipProgress.start(animeSkipTotal, 0, { type: "anime-skip Entries" })
    let animeSkipCount = 0
    for (let index = 0; index < animeSkipTotal; index += 100) {
        const skipData = await fetch("https://api.anime-skip.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Client-Id": process.env.ANIME_SKIP_CLIENT_ID!
            },
            body: JSON.stringify({ query: `
    query {
        searchShows(limit: 100, offset: ${index}) {
            episodes {
                timestamps {
                    typeId,
                    at
                },
                number
            },
            externalLinks {
                service,
                serviceId
            }
        }
    }
            ` })
        }).then(res => res.json())
        if ("error" in skipData) {
            console.log(`Errored at offset ${index}`)
            process.exit(1)
        }
        if ("data" in skipData && "searchShows" in skipData.data) {
            for (const item of skipData.data.searchShows) {
                const link = item.externalLinks.find((link: any) => link.service === "anilist.co")
                if (typeof link !== "object") continue
                const entryIndex = videoEntries.findIndex(entry => entry.trackers.find(tracker => tracker.id === "anilist")?.entryId === link.serviceId)
                if (entryIndex === -1) continue
                const entry = videoEntries[entryIndex]
                if (typeof entry.skipTimes === "undefined" || entry.skipTimes === null) {
                    entry.skipTimes = (item.episodes.map((episode: any) => ({
                        episode: parseFloat(episode.number),
                        times: episode.timestamps.map((timestamp: any, index: number) => ({
                            type: parseAnimeSkipType(timestamp.typeId),
                            start: Math.max(timestamp.at, 0),
                            end: index >= episode.timestamps.length - 1 ? undefined : Math.max(episode.timestamps[index + 1].at, 0)
                        } as Entry.SkipTimeItem))
                    } as Entry.SkipTime)) as Entry.SkipTime[]).filter(time => time.episode !== null && !isNaN(time.episode))
                } else {
                    entry.skipTimes.push(...(item.episodes.map((episode: any) => ({
                        episode: parseFloat(episode.number),
                        times: episode.timestamps.map((timestamp: any, index: number) => ({
                            type: parseAnimeSkipType(timestamp.typeId),
                            start: Math.max(timestamp.at, 0),
                            end: index >= episode.timestamps.length - 1 ? undefined : Math.max(episode.timestamps[index + 1].at, 0)
                        } as Entry.SkipTimeItem))
                    } as Entry.SkipTime)) as Entry.SkipTime[]).filter(time => time.episode !== null && !isNaN(time.episode)))
                }
                console.log(`Pushed ${(item.episodes as any[]).reduce((p, c) => p + c.timestamps.length, 0)} timestamps for ${item.episodes.length} episodes to ${entry.title}`)
                videoEntries[entryIndex] = entry
                animeSkipCount++
                //animeSkipProgress.update(animeSkipCount)
            }
        }
    }
    //animeSkipProgress.stop()
    console.log(`Fetching Anilist data and updating entries in database...`)
    const anilistProgress = new progress.MultiBar({
        clearOnComplete: false,
        hideCursor: true, 
        format: "{type} | {bar} | {percentage}% | {value} of {total}"
    }, progress.Presets.rect)
    const textAnilistProgress = anilistProgress.create(textEntries.length, 0, { type: "Text      " })
    const textDbProgress = anilistProgress.create(textEntries.length, 0, { type: "Text (DB) " })
    const imageAnilistProgress = anilistProgress.create(imageEntries.length, 0, { type: "Image     " })
    const imageDbProgress = anilistProgress.create(imageEntries.length, 0, { type: "Image (DB)" })
    const videoAnilistProgress = anilistProgress.create(videoEntries.length, 0, { type: "Video     " })
    const videoDbProgress = anilistProgress.create(videoEntries.length, 0, { type: "Video (DB)" })
    let newTextEntryCount = 0
    let newImageEntryCount = 0
    let newVideoEntryCount = 0
    let newEntries: { text: string[], image: string[], video: string[] } = { text: [], image: [], video: [] }
    await new Promise<void>(async (res) => {
        for (let index = 0; index < textEntries.length; index += 50) {
            const time = Date.now()
            const chunk = await updateAnilistInfoBatch(textEntries.slice(index, Math.min(index + 50, textEntries.length)), MediaType.TEXT)
            textAnilistProgress.increment(chunk.length)
            await Promise.all(
                chunk.map(entry => new Promise<void>(async (res) => {
                    const dbEntry = await db.getDatabaseEntry({
                        $or: entry.trackers.filter(tracker => tracker.id === "myanimelist" || tracker.id === "anilist").map(tracker => ({ trackers: tracker }))
                    }, MediaType.TEXT) as Entry & { _id?: MUUID } | null
                    if (dbEntry === null) {
                        await db.addDatabaseEntry(MediaType.TEXT, entry)
                        newTextEntryCount++
                        newEntries.text.push(entry.title)
                    } else {
                        const id = dbEntry._id!
                        delete dbEntry._id
                        // if (!objectEquals(entry, dbEntry, {strict: true})) {
                        const updatedEntry = updateLatestEntries(dbEntry, entry)
                        await db.setDatabaseEntry(MediaType.TEXT, { ...updatedEntry, _id: id })
                        // }
                    }
                    textDbProgress.increment()
                    res()
                }))
            )
            await new Promise(res => setTimeout(res, Math.max(700 - Date.now() + time, 0)))
        }
        res()
    })
    await new Promise<void>(async (res) => {
        for (let index = 0; index < imageEntries.length; index += 50) {
            const time = Date.now()
            const chunk = await updateAnilistInfoBatch(imageEntries.slice(index, Math.min(index + 50, imageEntries.length)), MediaType.IMAGE)
            imageAnilistProgress.increment(chunk.length)
            await Promise.all(
                chunk.map(entry => new Promise<void>(async (res) => {
                    const dbEntry = await db.getDatabaseEntry({
                        $or: entry.trackers.filter(tracker => tracker.id === "myanimelist" || tracker.id === "anilist").map(tracker => ({ trackers: tracker }))
                    }, MediaType.IMAGE) as Entry & { _id?: MUUID } | null
                    if (dbEntry === null) {
                        await db.addDatabaseEntry(MediaType.IMAGE, entry)
                        newImageEntryCount++
                        newEntries.image.push(entry.title)
                    } else {
                        const id = dbEntry._id!
                        delete dbEntry._id
                        // if (!objectEquals(entry, dbEntry, {strict: true})) {
                        const updatedEntry = updateLatestEntries(dbEntry, entry)
                        await db.setDatabaseEntry(MediaType.IMAGE, { ...updatedEntry, _id: id })
                        // }
                    }
                    imageDbProgress.increment()
                    res()
                }))
            )
            await new Promise(res => setTimeout(res, Math.max(700 - Date.now() + time, 0)))
        }
        res()
    })
    await new Promise<void>(async (res) => {
        for (let index = 0; index < videoEntries.length; index += 50) {
            const time = Date.now()
            const chunk = await updateAnilistInfoBatch(videoEntries.slice(index, Math.min(index + 50, videoEntries.length)), MediaType.VIDEO)
            videoAnilistProgress.increment(chunk.length)
            await Promise.all(
                chunk.map(entry => new Promise<void>(async (res) => {
                    let dbEntry = await db.getDatabaseEntry({
                        $or: entry.trackers.filter(tracker => tracker.id === "myanimelist" || tracker.id === "anilist").map(tracker => ({ trackers: tracker }))
                    }, MediaType.VIDEO) as Entry & { _id?: MUUID } | null
                    if (dbEntry === null) {
                        await db.addDatabaseEntry(MediaType.VIDEO, entry)
                        newVideoEntryCount++
                        newEntries.video.push(entry.title)
                    } else {
                        const id = dbEntry._id!
                        delete dbEntry._id
                        //if (!objectEquals(entry, dbEntry, {strict: true})) {
                        const updatedEntry = updateLatestEntries(dbEntry, entry)
                        await db.setDatabaseEntry(MediaType.VIDEO, { ...updatedEntry, _id: id })
                        //}
                    }
                    videoDbProgress.increment()
                    res()
                }))
            )
            await new Promise(res => setTimeout(res, Math.max(700 - Date.now() + time, 0)))
        }
        res()
    })
    anilistProgress.stop()
    console.log(`Totals:\n\tNew text entries: ${newTextEntryCount}\n\tNew image entries: ${newImageEntryCount}\n\tNew video entries: ${newVideoEntryCount}`)
    writeFileSync("new.json", JSON.stringify(newEntries, null, 2))
    console.log("Cleaning up...");
    // rmSync(`./MAL-Sync-Backup`, {recursive: true});
    console.log("Done cleaning up.");
    process.exit(0);
}

function updateLatestEntries(dbEntry: Entry, entry: Entry): Entry {
    for (const platform of dbEntry.platforms) {
        for (const source of platform.sources) {
            if (typeof source.latestId === 'string' || typeof source.user === 'string') {
                const platformIndex = entry.platforms.findIndex(p => p.id === platform.id)
                if (platformIndex !== -1) {
                    const sourceIndex = entry.platforms[platformIndex].sources.findIndex(s => s.id === source.id && s.entryId === source.entryId)
                    if (sourceIndex !== -1) {
                        entry.platforms[platformIndex].sources[sourceIndex].latestId = source.latestId
                        entry.platforms[platformIndex].sources[sourceIndex].user = source.user
                    }
                }
            }
        }
    }
    return entry
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

async function updateAnilistInfoBatch(entries: Entry[], mediaType: MediaType): Promise<Entry[]> {
    const alIds = entries.map(entry => entry.trackers.find(tracker => tracker.id === 'anilist')?.entryId).filter(id => typeof id === 'string').map((id: string) => parseInt(id))
    const alData = await fetch(`https://graphql.anilist.co`, {
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: `
query {
    Page(page: 1, perPage: ${alIds.length}) {
        media(id_in: ${JSON.stringify(alIds)}, type: ${mediaType === MediaType.VIDEO ? "ANIME" : "MANGA"}) {
            id,
            title {
                english,
                romaji
            },
            status(version: 2),
            description,
            coverImage {
                large,
                medium,
                color
            },
            bannerImage,
            genres,
            synonyms,
            meanScore,
            staff {
                edges {
                    node {
                        name {
                            full
                        },
                        image {
                            large
                        }
                    },
                    role
                }
            },
            isAdult
        }
    }
}
            `
        }),
        method: "POST"
    }).then(res => res.json()).then(json => json.data?.Page?.media ?? null)
    if (alData === null) return entries
    for (const item of alData) {
        const entryIndex = entries.findIndex(entry => entry.trackers.some(tracker => tracker.id === "anilist" && tracker.entryId === `${item.id}`))
        if (entryIndex === -1) continue
        let entry = entries[entryIndex]
        entry.title = item.title?.english ?? item.title?.romaji ?? entry.title
        entry.alternativeTitles = [...(typeof item.title?.english === 'string' && typeof item.title?.romaji === 'string' ? [item.title.romaji] : []), ...(item.synonyms ?? [])].map((title: string) => ({ title }))
        entry.covers = [...(typeof item.coverImage?.large === 'string' ? [{ image: item.coverImage.large, quality: Entry.ImageQuality.HIGH }] : []), ...(typeof item.coverImage?.medium === 'string' ? [{ image: item.coverImage.large, quality: Entry.ImageQuality.MEDIUM }] : [])]
        entry.banners = (typeof item.bannerImage === 'string' ? [{ image: item.bannerImage, quality: Entry.ImageQuality.UNKNOWN }] : [])
        entry.color = item.coverImage?.color
        entry.description = item.description
        entry.contentRating = item.isAdult === true ? Entry.ContentRating.NSFW : item.isAdult === false ? Entry.ContentRating.SAFE : Entry.ContentRating.UNKNOWN
        entry.score = typeof item.meanScore === 'number' ? item.meanScore / 10 : undefined
        entry.status = item.status === "FINISHED" ? Entry.Status.COMPLETED : item.status === "RELEASING" ? Entry.Status.RELEASING : item.status === "NOT_YET_RELEASED" ? Entry.Status.UNRELEASED : item.status === "CANCELLED" ? Entry.Status.CANCELLED : item.status === "HIATUS" ? Entry.Status.HIATUS : Entry.Status.UNKNOWN
        entry.tags = item.genres?.map((name: string) => ({ name })) ?? []
        entry.staff = item.staff?.edges?.map((edge: any) => ({ name: edge.node?.name?.full, role: edge.role, image: edge.node?.image?.large })).filter((staff: Partial<Entry.Staff>) => typeof staff.name === 'string') ?? []
        entries[entryIndex] = entry
    }
    return entries
}

function parseAnimeSkipType(id: string): Entry.SkipTimeItemType {
    switch (id) {
        case "9edc0037-fa4e-47a7-a29a-d9c43368daa8": return Entry.SkipTimeItemType.CANON
        case "e384759b-3cd2-4824-9569-128363b4452b": return Entry.SkipTimeItemType.MUST_WATCH
        case "97e3629a-95e5-4b1a-9411-73a47c0d0e25": return Entry.SkipTimeItemType.BRANDING
        case "14550023-2589-46f0-bfb4-152976506b4c": return Entry.SkipTimeItemType.INTRO
        case "cbb42238-d285-4c88-9e91-feab4bb8ae0a": return Entry.SkipTimeItemType.MIXED_INTRO
        case "679fb610-ff3c-4cf4-83c0-75bcc7fe8778": return Entry.SkipTimeItemType.NEW_INTRO
        case "f38ac196-0d49-40a9-8fcf-f3ef2f40f127": return Entry.SkipTimeItemType.RECAP
        case "c48f1dce-1890-4394-8ce6-c3f5b2f95e5e": return Entry.SkipTimeItemType.FILLER
        case "9f0c6532-ccae-4238-83ec-a2804fe5f7b0": return Entry.SkipTimeItemType.TRANSITION
        case "2a730a51-a601-439b-bc1f-7b94a640ffb9": return Entry.SkipTimeItemType.CREDITS
        case "6c4ade53-4fee-447f-89e4-3bb29184e87a": return Entry.SkipTimeItemType.MIXED_CREDITS
        case "d839cdb1-21b3-455d-9c21-7ffeb37adbec": return Entry.SkipTimeItemType.NEW_CREDITS
        case "c7b1eddb-defa-4bc6-a598-f143081cfe4b": return Entry.SkipTimeItemType.PREVIEW
        case "67321535-a4ea-4f21-8bed-fb3c8286b510": return Entry.SkipTimeItemType.TITLE_CARD
        case "ae57fcf9-27b0-49a7-9a99-a91aa7518a29": return Entry.SkipTimeItemType.UNKNOWN
        default: return Entry.SkipTimeItemType.UNKNOWN
    }
}