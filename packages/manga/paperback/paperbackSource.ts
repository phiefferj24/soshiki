import { Manga, MangaPageResult, MangaChapter, MangaPage, type MangaSource, MangaSourceType, type ExternalMangaSource, MangaStatus, MangaContentRating } from "../mangaSource";
import * as Source from "../../source";
import cheerio from "cheerio"
import * as PB from 'paperback-extensions-common'
import Cookie from 'js-cookie'

export default class PaperbackSource implements MangaSource {
    name: string;
    id: string;
    version: string;
    type: MangaSourceType;
    nsfw: number;
    image: string;
    source: PB.Source;
    info: PB.SourceInfo;
    searchMetadata: any;
    listingMetadata: any;
    async init(json: any, url: string): Promise<void> {
        if (!globalThis.createRequestManager) await PaperbackSource.globalInit();
        let res = await fetch(`${url}/${json.id}/source.js`);
        let text = await res.text();
        eval(text);
        this.source = new globalThis.Sources[`${json.id}`](cheerio) as PB.Source;
        this.info = globalThis.Sources[`${json.id}Info`] as PB.SourceInfo;
        this.name = this.info.name;
        this.id = json.id;
        this.version = this.info.version;
        this.type = MangaSourceType.paperback;
        this.nsfw = json.nsfw;
        this.image = json.image;
    }
    async getListings(): Promise<Source.Listing[]> {
        if (!this.source.getHomePageSections) return [];
        let sections: PB.HomeSection[] = [];
        await this.source.getHomePageSections(sec => { 
            if (!sec.view_more) return;
            let index = sections.findIndex((item) => item.id === sec.id);
            if (index === -1) sections.push(sec);
            else sections[index] = sec; 
        });
        return sections.map(v => new Source.Listing(v.title, v.id));
    }
    async getFilters(): Promise<Source.Filter[]> {
        let tagSections = await this.source.getSearchTags?.() ?? [];
        let canExclude = (await this.source.supportsTagExclusion?.()) ?? false;
        let filters: Source.Filter[] = tagSections.map(tagSection => new Source.MultiSelectFilter(tagSection.label, tagSection.tags.map(tag => tag.label), canExclude, tagSection.tags.map(tag => tag.id)));
        if ((await this.source.supportsSearchOperators?.()) ?? false) filters.push(new Source.SingleSelectFilter("Include Operator", ["AND", "OR"], false));
        if ((await this.source.supportsSearchOperators?.()) ?? false) filters.push(new Source.SingleSelectFilter("Exclude Operator", ["AND", "OR"], false));
        return filters;
    }
    async getMangaList(filters: Source.Filter[], page: number): Promise<MangaPageResult> {
        let title = "";
        let includedTags: PB.Tag[] = [];
        let excludedTags: PB.Tag[] = [];
        let includeOperator: PB.SearchOperator;
        let excludeOperator: PB.SearchOperator;
        for (let filter of filters) {
            if (filter.name === "Title") {
                title = filter.value as string ?? "";
            } else if (filter.type === Source.FilterType.singleSelect) {
                let ssFilter = filter as Source.SingleSelectFilter;
                if (ssFilter.index !== -1) {
                    if (ssFilter.name === "Include Operator") includeOperator = ssFilter.index === 0 ? "AND" as PB.SearchOperator : "OR" as PB.SearchOperator;
                    else if (ssFilter.name === "Exclude Operator") excludeOperator = ssFilter.index === 0 ? "AND" as PB.SearchOperator : "OR" as PB.SearchOperator;
                }
            } else if (filter.type === Source.FilterType.multiSelect) {
                let msFilter = filter as Source.MultiSelectFilter;
                msFilter.indices.forEach(value => {
                    if (msFilter.excludings.includes(value)) excludedTags.push({ id: msFilter.ids[value], label: msFilter.value[value] });
                    else includedTags.push({ id: msFilter.ids[value], label: msFilter.value[value] });
                });
            }
        }
        let result = await this.source.getSearchResults({
            title: title,
            parameters: undefined,
            includedTags, excludedTags, includeOperator, excludeOperator
        }, page === 1 ? {} : this.searchMetadata ?? {});
        this.searchMetadata = result.metadata;
        let manga: Manga[] = [];
        for (let m of result.results) {
            manga.push(new Manga(m.id, m.title.text, m.subtitleText?.text ?? "", "", "", [], m.image, "", MangaStatus.unknown, MangaContentRating.safe));
        }
        return new MangaPageResult(manga, manga.length > 0);
    }
    async getMangaListing(listing: Source.Listing, page: number): Promise<MangaPageResult> {
        let result = await this.source.getViewMoreItems(listing.id, page === 1 ? {} : this.listingMetadata ?? {});
        this.listingMetadata = result.metadata;
        let manga: Manga[] = [];
        for (let m of result.results) {
            manga.push(new Manga(m.id, m.title.text, m.subtitleText?.text ?? "", "", "", [], m.image, "", MangaStatus.unknown, MangaContentRating.safe));
        }
        return new MangaPageResult(manga, manga.length > 0);
    }
    async getMangaDetails(id: string): Promise<Manga> {
        let res2 = await this.source.getMangaDetails(id) as any;
        let res: PB.Manga;
        if (typeof res2.title !== undefined) res = res2 as PB.Manga;
        else res = (res2 as PB.SourceManga).mangaInfo;
        let status = MangaStatus.unknown;
        switch (res.status) {
            case 0: status = MangaStatus.completed; break;
            case 1: status = MangaStatus.ongoing; break;
            case 2: status = MangaStatus.unknown; break;
            case 3: status = MangaStatus.dropped; break;
            case 4: status = MangaStatus.hiatus; break;
        }
        return new Manga(id, res.titles[0], res.author, res.artist, res.desc, res.tags.map(tagsec => tagsec.tags.map(tag => tag.label)).flat(), res.image, this.source.getMangaShareUrl?.(id), status, res.hentai ? MangaContentRating.nsfw : MangaContentRating.safe);
    }
    async getMangaChapters(id: string): Promise<MangaChapter[]> {
        let res = await this.source.getChapters(id);
        let chapters: MangaChapter[] = [];
        for (let chap of res) {
            chapters.push(new MangaChapter(chap.id, chap.chapNum, chap.name, chap.group, chap.time, chap.langCode, chap.volume === 0 ? undefined : chap.volume));
        }
        return chapters;
    }
    async getMangaChapterPages(id: string, chapterId: string): Promise<MangaPage[]> {
        let res = await this.source.getChapterDetails(id, chapterId);
        return res.pages.map((page, index) => new MangaPage(index, page));
    }
    static async parseSourceList(url: string): Promise<ExternalMangaSource[]> {
        let response = await fetch(url + "/versioning.json");
        let json = await response.json();
        let sources: ExternalMangaSource[] = [];
        for (let source of json.sources) {
            sources.push({
                name: source.name,
                id: source.id,
                version: source.version,
                type: MangaSourceType.paperback,
                nsfw: source.contentRating === "EVERYONE" ? 0 : 2,
                listUrl: url,
                image: `${url}/${source.id}/includes/${source.icon}`
            })
        }
        return sources;
    }

    static async globalInit(): Promise<void> {
        let res = await fetch("/paperback.js");
        let text = await res.text();
        eval(text);
    }
    async modifyImageRequest(request: Request): Promise<Request> {
        let interceptor = this.source.requestManager.interceptor;
        if (interceptor) {
            let res = await interceptor.interceptRequest({
                url: request.url,
                method: "GET"
            })
            let headerString = Object.keys(res.headers ?? {}).length === 0 ? "" : (typeof res.param === 'undefined' ? "?" : "&");
            for (let header of Object.keys(res.headers ?? {})) {
                if(headerString.length !== 1) headerString += "&";
                headerString += "soshiki_set_header=";
                headerString += encodeURIComponent(`${header}:${res.headers[header]}`);
            }
            return new Request(`${res.url}${res.param ?? ""}${headerString}`, {
                body: res.data,
                method: res.method
            });
        } else {
            return new Request(`${request.url}${(request.url.includes("?") ? "&" : "?") + "soshiki_set_header=referer%3A"}`, {
                body: request.body,
                method: request.method
            });
        }
    }

    // copied most of this from nmn's paperback-to-aidoku
    static async importBackup(buffer: ArrayBuffer, installSourcesCallback: (sourceIds: string[]) => Promise<string[]>, linkMangaCallback: (manga: {manga: Manga, sourceId: string}[]) => Promise<{id: string, manga: Manga, sourceId: string}[]>): Promise<void> {
        let str = new TextDecoder().decode(buffer);
        let json = JSON.parse(str);

        let ids: string[] = [];
        let sourceIds: string[] = [];
        let manga: {manga: Manga, sourceId: string}[] = []; // mangaid, sourceid
        for (const item of json.library) {
            ids.push(item.manga.id);
        }

        for (const item of json.sourceMangas) {
            if (!ids.includes(item.manga.id)) continue;
            if (!sourceIds.includes(item.sourceId)) sourceIds.push(item.sourceId);
            manga.push({manga: {
                id: item.mangaId,
                title: item.manga.titles[0],
                author: item.manga.author,
                artist: item.manga.artist,
                cover: item.manga.image
            }, sourceId: item.sourceId});
        }

        await installSourcesCallback(sourceIds);

        let linkedManga = await linkMangaCallback(manga);

        let res = await fetch(`https://api.soshiki.moe/library/manga`, {
            headers: { Authorization: `Bearer ${Cookie.get("access")}` }
        });
        let library = await res.json();

        for (const item of linkedManga) {
            if (!library.includes(item.id)) {
                await fetch(`https://api.soshiki.moe/library/manga/${item.id}`, {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${Cookie.get("access")}` }
                });
            }
        }

        let history: {id: string, page: number, chapter: number}[] = [];

        for (const item of json.chapterMarkers) {
            if (typeof item.chapter === 'undefined' || typeof item.chapter.chapNum === 'undefined' || typeof item.lastPage === 'undefined') continue;
            if (linkedManga.findIndex(obj => obj.manga.id === item.chapter.mangaId) === -1) continue;
            let mangaObject = linkedManga.find(obj => obj.manga.id === item.chapter.mangaId);
            let oldIndex = history.findIndex(obj => obj.id === mangaObject.id);
            if (oldIndex === -1) history.push({id: mangaObject.id, page: item.lastPage, chapter: item.chapter.chapNum});
            else if (history[oldIndex].chapter < item.chapter.chapNum) {
                history.splice(oldIndex, 1);
                history.push({id: mangaObject.id, page: item.lastPage, chapter: item.chapter.chapNum});
            }
        }

        for (const item of history) {
            await fetch(`https://api.soshiki.moe/history/manga/${item.id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${Cookie.get("access")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    page: item.page,
                    chapter: item.chapter,
                    trackers: ["mal", "anilist"]
                })
            });
        }
    }
}