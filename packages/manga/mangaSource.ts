import type { Source, Filter, Listing } from '../source';

import AidokuSource from './aidoku-ts/aidokuSource';
import PaperbackSource from './paperback/paperbackSource'

export enum MangaSourceType {
    aidoku = 'aidoku',
    paperback = 'paperback'
}

let mangaSourceClasses = {
    aidoku: AidokuSource,
    paperback: PaperbackSource
}

export interface MangaSource extends Source {
    name: string;
    id: string;
    version: string;
    type: MangaSourceType;
    nsfw: number;
    image: string;

    init(json: any, url: string): Promise<void>;
    getFilters(): Promise<Filter[]>;
    getListings(): Promise<Listing[]>;
    getMangaList(filters: Filter[], page: number): Promise<MangaPageResult>;
    getMangaListing(listing: Listing, page: number): Promise<MangaPageResult>;
    getMangaDetails(id: string): Promise<Manga>;
    getMangaChapters(id: string): Promise<MangaChapter[]>;
    getMangaChapterPages(id: string, chapterId: string): Promise<MangaPage[]>;
    modifyImageRequest(request: Request): Promise<Request>;
}

export type ExternalMangaSource = {
    name: string;
    id: string;
    version: string;
    type: MangaSourceType;
    nsfw: number;
    image: string;
    listUrl: string;
}

export async function parseSourceList(type: MangaSourceType, url: string): Promise<ExternalMangaSource[]> {
    let sources = await mangaSourceClasses[type].parseSourceList(url);
    return sources;
}

export async function install(type: MangaSourceType, json: any, url: string): Promise<MangaSource> {
    let source = new mangaSourceClasses[type]();
    await source.init(json, url);
    return source;
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