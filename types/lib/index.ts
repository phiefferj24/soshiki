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