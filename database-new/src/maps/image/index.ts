import { MalSyncLink, Mapper } from ".."
export const ImageMappers: {[key: string]: Mapper} = {
    "mangadex": (malSyncLink: MalSyncLink) => ({
        id: "multi_mangadex",
        name: "MangaDex",
        entryId: malSyncLink.identifier
    }),
    "manganato": (malSyncLink: MalSyncLink) => ({
        id: "en_manganato",
        name: "MangaNato",
        entryId: malSyncLink.url
    }),
    "mangasee": (malSyncLink: MalSyncLink) => ({
        id: "en_mangasee",
        name: "MangaSee",
        entryId: malSyncLink.identifier
    })
}