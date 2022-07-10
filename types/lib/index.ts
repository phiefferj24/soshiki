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
    }
}

export enum Status {
    unknown,
    ongoing,
    completed,
    dropped,
    hiatus,
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