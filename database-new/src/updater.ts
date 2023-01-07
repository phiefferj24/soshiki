import { readFileSync, rmSync, readdirSync } from "fs"
import { spawnSync } from "child_process"
import { Database } from "."
import { Entry, MediaType } from "soshiki-types"
import { ImageMappers, MalSyncLink, VideoMappers, TextMappers } from "./maps"

async function main() {
    const db = await Database.connect()

    const REPO_URL = "https://github.com/MALSync/MAL-Sync-Backup.git";

    let mangaToAdd: {[key: string]: any}[] = [];
    let animeToAdd: {[key: string]: any}[] = [];
    let novelsToAdd: {[key: string]: any}[] = [];

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
    console.log("Reading anime files...");
    for (const alAnimeFile of alAnimeFiles) {
        const alData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/anilist/anime/${alAnimeFile}.json`, 'utf8'))
        const malFileIndex = malAnimeFiles.indexOf(alData.malId ?? -1)
        let malData: any
        if (malFileIndex > 0) malData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/myanimelist/anime/${malAnimeFiles.splice(malFileIndex, 1)[0]}.json`, 'utf8'))
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
        videoEntries.push(entry)
    }
    for (const malAnimeFile of malAnimeFiles) { // clean up
        const malData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/myanimelist/anime/${malAnimeFile}.json`, 'utf8'))
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
        videoEntries.push(entry)
    }
    console.log("Reading manga files...")
    for (const alMangaFile of alMangaFiles) {
        const alData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/anilist/manga/${alMangaFile}.json`, 'utf8'))
        const malFileIndex = malMangaFiles.indexOf(alData.malId ?? -1)
        let malData: any
        if (malFileIndex > 0) malData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/myanimelist/manga/${malMangaFiles.splice(malFileIndex, 1)[0]}.json`, 'utf8'))
        const isNovel = alData.category === 'novel' || malData?.category === 'Light Novel'
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
        if (isNovel) textEntries.push(entry)
        else imageEntries.push(entry)
    }
    for (const malMangaFile of malMangaFiles) {
        if (malMangaFile === '_index.json') continue
        const malData = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/myanimelist/manga/${malMangaFile}.json`, 'utf8'))
        const isNovel = malData.category === 'Light Novel'
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
        if (isNovel) textEntries.push(entry)
        else imageEntries.push(entry)
    }
    console.log(`Totals:\n\t${textEntries.length} text entries\n\t${imageEntries.length} image entries\n\t${videoEntries.length} video entries`)
    console.log("Adding entries to database...")
    await Promise.all([
        db.addDatabaseEntries(MediaType.TEXT, textEntries),
        db.addDatabaseEntries(MediaType.IMAGE, imageEntries),
        db.addDatabaseEntries(MediaType.VIDEO, videoEntries)
    ])
    console.log("Cleaning up...");
    // rmSync(`./MAL-Sync-Backup`, {recursive: true});
    console.log("Done cleaning up.");
    process.exit(0);
}
main().then(() => {process.exit(0)})