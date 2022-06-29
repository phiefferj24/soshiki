export enum MangaSourceType {
    Aidoku = 'aidoku',
}

export interface MangaSource {
    name: string;
    id: string;
    version: string;
    type: MangaSourceType;
    nsfw: number;
    image: string;

    init(url: string): Promise<void>;
    getMangaList(filters: MangaFilter[], page: number): Promise<MangaPageResult>;
    getMangaListing(name: string, page: number): Promise<MangaPageResult>;
    getMangaDetails(id: string): Promise<Manga>;
    getMangaChapters(id: string): Promise<MangaChapter[]>;
    getMangaChapterPages(id: string, chapterId: string): Promise<MangaPage[]>;
}

export class Manga {
    id: string;
    title?: string;
    author?: string;
    artist?: string;
    description?: string;
    tags?: string[];
    cover?: string;
    url?: string;
    status?: MangaStatus;
    nsfw?: MangaContentRating;

    constructor(id: string, title?: string, author?: string, artist?: string, description?: string, tags?: string[], cover?: string, url?: string, status?: MangaStatus, nsfw?: MangaContentRating) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.artist = artist;
        this.description = description;
        this.tags = tags;
        this.cover = cover;
        this.url = url;
        this.status = status;
        this.nsfw = nsfw;
    }
}

export enum MangaStatus {
    unknown,
    ongoing,
    completed,
    dropped,
    hiatus,
}

export enum MangaContentRating {
    safe,
    suggestive,
    nsfw,
}

export class MangaFilter {
    name: string;
    type: MangaFilterType;
    value?: string | string[];
    ids?: any[];
    ascending?: boolean;
    index: number = 0;

    constructor(name: string, type: MangaFilterType, value?: string | string[], ids?: any[], ascending?: boolean, index: number = 0) {
        this.name = name;
        this.type = type;
        this.value = value;
        this.ids = ids;
        this.ascending = ascending;
        this.index = index;
    }
}

export enum MangaFilterType {
    text,
    singleSelect,
    singleSelectAscendable,
    multiSelect,
    multiSelectAscendable,
}

export class MangaChapter {
    id: string;
    title?: string;
    scanlator?: string;
    date?: Date;
    lang?: string;
    chapter: number;
    volume?: number;

    constructor(id: string, chapter: number, title?: string, scanlator?: string, date?: Date, lang?: string, volume?: number) {
        this.id = id;
        this.title = title;
        this.scanlator = scanlator;
        this.date = date;
        this.lang = lang;
        this.chapter = chapter;
        this.volume = volume;
    }
}

export class MangaPage {
    index: number
    url?: string;
    base64?: string;

    constructor(index: number, url?: string, base64?: string) {
        this.index = index;
        this.url = url;
        this.base64 = base64;
    }
}

export class MangaPageResult {
    manga: Manga[];
    hasMore: boolean;

    constructor(manga: Manga[], hasMore: boolean) {
        this.manga = manga;
        this.hasMore = hasMore;
    }
}