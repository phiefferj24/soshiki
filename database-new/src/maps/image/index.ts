import { MalSyncLink, Mapper } from ".."
export const ImageMappers: {[key: string]: Mapper} = {
    "mangadex": (malSyncLink: MalSyncLink) => ({
        id: "multi_mangadex",
        name: "MangaDex",
        entryId: malSyncLink.identifier
    })
}