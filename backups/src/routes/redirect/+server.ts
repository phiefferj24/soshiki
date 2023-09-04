import type { RequestHandler } from "./$types";
import { readFileSync } from "fs"
import { join } from "path"
import type { IdentifiedTextEntry, IdentifiedImageEntry, IdentifiedVideoEntry, TextHistory, ImageHistory, VideoHistory } from "soshiki-sources"
import type { User } from "../../../../database-new/src";
import { Entry, MediaType } from "soshiki-types";
import MUUID from "uuid-mongodb"
import { error } from "@sveltejs/kit";

type LibraryItem = {
    mediaType: "TEXT" | "IMAGE" | "VIDEO",
    id: string,
    sourceId: string,
    categories: string[]
}
type LibraryCategory = {
    mediaType: "TEXT" | "IMAGE" | "VIDEO",
    id: string,
    name: string
}
type TIVCodable<T extends {}, I extends {}, V extends {}> = {
    text: T,
    image: I,
    video: V
}
type Backup = {
    sources: TIVCodable<[], [], []>
    library: LibraryItem[],
    libraryCategories: LibraryCategory[],
    history: TIVCodable<TextHistory[], ImageHistory[], VideoHistory[]>,
    entries: TIVCodable<IdentifiedTextEntry[], IdentifiedImageEntry[], IdentifiedVideoEntry[]>,
    version: string,
    schema: number,
    time: number
}

export const GET: RequestHandler = async ({url, locals}) => {
    const data = await fetch(`https://discord.com/api/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=authorization_code&code=${url.searchParams.get("code")}&redirect_uri=${encodeURIComponent(url.href.split("?")[0])}&client_id=${process.env.DISCORD_ID}&client_secret=${process.env.DISCORD_SECRET}`
    }).then(res => res.json())
    const user = await fetch(`https://discord.com/api/users/@me`, { headers: { Authorization: `Bearer ${data.access_token}` } }).then(res => res.json())
    const dbUser = await locals.db.getUser({ discord: user.id }) as User
    if (dbUser === null || typeof dbUser.libraries === "undefined" || typeof dbUser.histories === "undefined") return new Response(null, { status: 500 })
    let textEntries: IdentifiedTextEntry[] = []
    let imageEntries: IdentifiedImageEntry[] = []
    let videoEntries: IdentifiedVideoEntry[] = []
    let libraryItems: LibraryItem[] = []
    let libraryCategories: LibraryCategory[] = []
    let textHistory: TextHistory[] = []
    let imageHistory: ImageHistory[] = []
    let videoHistory: VideoHistory[] = []
    for (const id of dbUser.libraries.text.all.ids) {
        const entry = await locals.db.getDatabaseEntry({ _id: MUUID.from(id) }, MediaType.TEXT)
        if (entry === null) continue
        const source = entry.platforms.find(p => p.id === "soshiki")?.sources.find(() => true)
        if (typeof source === "undefined") continue
        libraryItems.push({
            mediaType: "TEXT",
            id: source.entryId,
            sourceId: source.id,
            categories: dbUser.libraries.text.categories.filter(c => c.ids.includes(id)).map(c => c.id)
        })
        textEntries.push({
            sourceId: source.id,
            id: source.entryId,
            title: entry.title,
            cover: entry.covers.find(() => true)?.image,
            alternativeTitles: [],
            alternativeCovers: [],
            alternativeBanners: [],
            tags: [],
            contentRating: "UNKNOWN",
            status: "UNKNOWN",
            links: []
        })
    }
    for (const id of dbUser.libraries.image.all.ids) {
        const entry = await locals.db.getDatabaseEntry({ _id: MUUID.from(id) }, MediaType.IMAGE)
        if (entry === null) continue
        const source = entry.platforms.find(p => p.id === "soshiki")?.sources.find(() => true)
        if (typeof source === "undefined") continue
        libraryItems.push({
            mediaType: "IMAGE",
            id: source.entryId,
            sourceId: source.id,
            categories: dbUser.libraries.image.categories.filter(c => c.ids.includes(id)).map(c => c.id)
        })
        imageEntries.push({
            sourceId: source.id,
            id: source.entryId,
            title: entry.title,
            cover: entry.covers.find(() => true)?.image,
            alternativeTitles: [],
            alternativeCovers: [],
            alternativeBanners: [],
            tags: [],
            contentRating: "UNKNOWN",
            status: "UNKNOWN",
            links: []
        })
    }
    for (const id of dbUser.libraries.video.all.ids) {
        const entry = await locals.db.getDatabaseEntry({ _id: MUUID.from(id) }, MediaType.VIDEO)
        if (entry === null) continue
        const source = entry.platforms.find(p => p.id === "soshiki")?.sources.find(() => true)
        if (typeof source === "undefined") continue
        libraryItems.push({
            mediaType: "VIDEO",
            id: source.entryId,
            sourceId: source.id,
            categories: dbUser.libraries.video.categories.filter(c => c.ids.includes(id)).map(c => c.id)
        })
        videoEntries.push({
            sourceId: source.id,
            id: source.entryId,
            title: entry.title,
            cover: entry.covers.find(() => true)?.image,
            alternativeTitles: [],
            alternativeCovers: [],
            alternativeBanners: [],
            tags: [],
            contentRating: "UNKNOWN",
            status: "UNKNOWN",
            season: "UNKNOWN",
            links: []
        })
    }
    for (const category of dbUser.libraries.text.categories) {
        libraryCategories.push({
            mediaType: "TEXT",
            id: category.id,
            name: category.name
        })
    }
    for (const category of dbUser.libraries.image.categories) {
        libraryCategories.push({
            mediaType: "IMAGE",
            id: category.id,
            name: category.name
        })
    }
    for (const category of dbUser.libraries.video.categories) {
        libraryCategories.push({
            mediaType: "VIDEO",
            id: category.id,
            name: category.name
        })
    }
    for (const history of dbUser.histories.text) {
        if (typeof history.chapter === "undefined" || typeof history.percent === "undefined") continue
        const entry = await locals.db.getDatabaseEntry({ _id: MUUID.from(history.id) }, MediaType.TEXT)
        if (entry === null) continue
        const source = entry.platforms.find(p => p.id === "soshiki")?.sources.find(() => true)
        if (typeof source === "undefined") continue
        textHistory.push({
            id: source.entryId,
            sourceId: source.id,
            chapter: history.chapter,
            percent: history.percent,
            volume: history.volume,
            status: "UNKNOWN"
        })
    }
    for (const history of dbUser.histories.image) {
        if (typeof history.chapter === "undefined" || typeof history.page === "undefined") continue
        const entry = await locals.db.getDatabaseEntry({ _id: MUUID.from(history.id) }, MediaType.IMAGE)
        if (entry === null) continue
        const source = entry.platforms.find(p => p.id === "soshiki")?.sources.find(() => true)
        if (typeof source === "undefined") continue
        imageHistory.push({
            id: source.entryId,
            sourceId: source.id,
            chapter: history.chapter,
            page: history.page,
            volume: history.volume,
            status: "UNKNOWN"
        })
    }
    for (const history of dbUser.histories.video) {
        if (typeof history.episode === "undefined" || typeof history.timestamp === "undefined") continue
        const entry = await locals.db.getDatabaseEntry({ _id: MUUID.from(history.id) }, MediaType.VIDEO)
        if (entry === null) continue
        const source = entry.platforms.find(p => p.id === "soshiki")?.sources.find(() => true)
        if (typeof source === "undefined") continue
        videoHistory.push({
            id: source.entryId,
            sourceId: source.id,
            episode: history.episode,
            timestamp: history.timestamp,
            season: history.season,
            status: "UNKNOWN"
        })
    }
    const backup: Backup = {
        sources: {
            text: [],
            image: [],
            video: []
        },
        library: libraryItems,
        libraryCategories: libraryCategories,
        history: {
            text: textHistory,
            image: imageHistory,
            video: videoHistory
        },
        entries: {
            text: textEntries,
            image: imageEntries,
            video: videoEntries
        },
        version: "0.4.0",
        schema: 1,
        time: Date.now()
    }
    return new Response(JSON.stringify(backup), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Content-Disposition": "attachment; filename=backup1.json"
        }
    })
};