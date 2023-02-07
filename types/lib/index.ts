export type Medium = 'anime' | 'manga' | 'novel';
export type Json = { [key: string]: any };
export type Manifest = {
    api: {
        url: string;
        port: number;
    },
    site: {
        url: string;
        port: number;
    },
    proxy: {
        url: string;
        port: number;
    },
    discord: {
        bot: {
            token: string;
        },
        client: {
            id: string;
            secret: string;
        },
        url: string;
        cdn: string;
    },
    mal: {
        url: string;
        id: string;
        secret: string;
    },
    anilist: {
        url: string;
        id: string;
        secret: string;
    }
}

export type PublicManifest = {
    api: {
        url: string;
        port: number;
    },
    site: {
        url: string;
        port: number;
    },
    proxy: {
        url: string;
        port: number;
    }
}

export enum Status {
    unknown,
    ongoing,
    completed,
    dropped,
    hiatus,
}

export enum TrackerStatus {
    unknown,
    planned,
    ongoing,
    completed,
    dropped,
    paused
}  

export type TrackerRequest = {
    page?: number;
    chapter?: number;
    timestamp?: number;
    episode?: number;
    status?: TrackerStatus;
    rating?: number;
    trackers?: string[];
}

export type TrackerResponse = {
    id?: string;
    page?: number;
    rating?: number;
    status?: TrackerStatus;
    chapter?: number;
    episode?: number;
    timestamp?: number;
    startTime?: number;
    lastTime?: number;
    tracker_ids?: { [id: string]: number };
}

export interface Tracker {
    updateHistoryItem(medium: Medium, id: string, request: TrackerRequest): Promise<void>;
    getHistoryItem(medium: Medium, id: string): Promise<TrackerResponse>;
    removeHistoryItem(medium: Medium, id: string): Promise<void>;
    getHistory(medium: Medium): Promise<TrackerResponse[]>;
    addToLibrary(medium: Medium, id: string, category: string): Promise<void>;
    removeFromLibrary(medium: Medium, id: string): Promise<void>;
    getLibrary(medium: Medium): Promise<{[category: string]: string[]}>;
    setLibraryCategory(medium: Medium, id: string, category: string): Promise<void>;
    addLibraryCategory(medium: Medium, category: string): Promise<void>;
    removeLibraryCategory(medium: Medium, category: string): Promise<void>;
}

export type Character = {
    name: string,
    role: string,
    image: string,
    id: string,
    actorName?: string,
    actorLanguage?: string,
    actorImage?: string,
    actorId?: string,
}

export type Staff = {
    name: string,
    role: string,
    image: string,
    id: string,
}

export type AnimeInfo = {
    title?: string,
    description?: string,
    banner?: string,
    cover?: string,
    genres?: string[],
    status?: Status,
    nsfw?: boolean,
    startDate?: Date,
    endDate?: Date,
    score?: number,
    popularity?: number,
    currentEpisode?: number,
    totalEpisodes?: number,
    characters?: Character[],
    staff?: Staff[],
    studios?: string[],
    producers?: string[],
}

export type User = {
    id: string,
    discord: string;
    connections: {[key: string]: any},
    data: {[key: string]: any},
}

export type Entry = {
    /** The type of the entry. */
    mediaType: MediaType
    /** The title of the entry. */
    title: string,
    /** Alternative titles for the entry. */
    alternativeTitles: Entry.AlternativeTitle[],
    /** A description of the entry. */
    description?: string,
    /** Staff for the entry. This includes authors, artists, voice actors, et cetera. */
    staff: Entry.Staff[],
    /** A list of covers for the entry in different qualities. */
    covers: Entry.Image[],
    /** The average color of the cover for UI purposes. Taken from the AniList API, if the entry has an AniList ID. */
    color?: string,
    /** A list of banners for the entry in different qualities. */
    banners: Entry.Image[],
    /** The average score, out of 10, given to this media by users. */
    score?: number
    /** The content rating of the entry. */
    contentRating: Entry.ContentRating
    /** The current status of the entry. */
    status: Entry.Status
    /** Tags that the entry has been given. */
    tags: Entry.Tag[]
    /** A list of links to external sites for the entry, often to tracker websites. */
    links: Entry.Link[]
    /** A list of platforms which have the entry in one or more of their sources. */
    platforms: Entry.Platform[]
    /** A list of trackers which the user can sync their history data with. These also provide entry data. */
    trackers: Entry.Tracker[]
}

export namespace Entry {
    export type AlternativeTitle = {
        /** The alternative title. */
        title: string,
        /** The type of alternative title, e.g. english or romaji. */
        type?: string
    }

    export type Staff = {
        /** The staff member's name. */
        name: string,
        /** The staff member's role in the production of the media. */
        role: string,
        /** An image of the staff member, if available. */
        image?: string
    }

    export type Image = {
        /** The URL to the image. */
        image: string,
        /** The quality of the image. */
        quality: Entry.ImageQuality
    }

    export enum ImageQuality {
        LOW = "LOW",
        MEDIUM = "MEDIUM",
        HIGH = "HIGH",
        FULL = "FULL",
        UNKNOWN = "UNKNOWN"
    }

    export type Link = {
        /** The name of the site that the link points to. */
        site: string,
        /** The actual URL for the link. */
        url: string
    }

    export type Platform = {
        /** The name of the platform. */
        name: string,
        /** The ID of the platform. */
        id: string,
        /** The sources of the platform which contain the entry. */
        sources: Source[]
    }

    export type Source = {
        /** The name of the source. */
        name: string,
        /** The ID of the source. */
        id: string,
        /** The internal ID for the source entry that corresponds to the entry. */
        entryId: string,
        /** The user that linked the source entry, if it was a user. */
        user?: string,
        /** The lastest chapter/episode ID for the entry. */
        latestId?: string
    }

    export type Tracker = {
        /** The name of the tracker. */
        name: string,
        /** The ID of the tracker. */
        id: string,
        /** The internal ID for the tracker entry that corresponds to the entry. */
        entryId: string
    }

    export enum ContentRating {
        SAFE = "SAFE",
        SUGGESTIVE = "SUGGESTIVE",
        NSFW = "NSFW",
        UNKNOWN = "UNKNOWN"
    }

    export type Tag = {
        /** The name of the tag. */
        name: string
    }

    export enum Status {
        COMPLETED = "COMPLETED",
        RELEASING = "RELEASING",
        UNRELEASED = "UNRELEASED",
        HIATUS = "HIATUS",
        CANCELLED = "CANCELLED",
        UNKNOWN = "UNKNOWN"
    }
}

export enum MediaType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO"
}

export type History = {
    /** The ID of the entry that the history entry corresponds to. */
    id: string,
    /** The page that the user is currently on, if applicable. */
    page?: number,
    /** The chapter that the user is currently on, if applicable. */
    chapter?: number,
    /** The volume that the user is currently on, if applicable. */
    volume?: number,
    /** The timestamp, in seconds, that the user is currently at, if applicable. */
    timestamp?: number,
    /** The episode that the user is currently on, if applicable. */
    episode?: number,
    /** The percent of the text that has been read, if applicable. */
    percent?: number,
    /** The score that the user has given the entry, if one has been given. */
    score?: number,
    /** The watching or reading status of the entry. */
    status: History.Status
}

export namespace History {
    export enum Status {
        COMPLETED = "COMPLETED",
        IN_PROGRESS = "IN_PROGRESS",
        PLANNED = "PLANNED",
        DROPPED = "DROPPED",
        PAUSED = "PAUSED",
        UNKNOWN = "UNKNOWN"
    }
}

export type Library = {
    /** The IDs of the entries in this library category. */
    ids: string[]
}

export type LibraryCategory = Library & {
        /** The ID of the library category. */
        id: string,
        /** The name of the library category. */
        name: string,
}