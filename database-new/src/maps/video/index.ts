import { MalSyncLink, Mapper } from "..";

export const VideoMappers: {[key: string]: Mapper} = {
    "gogoanime": (malSyncLink: MalSyncLink) => { 
        const match = malSyncLink.url.match(/\/category\/.*/)?.[0]
        if (typeof match === 'string') return {
            id: "en_gogoanime",
            name: "Gogoanime",
            entryId: match
        }
        return null
    }
}