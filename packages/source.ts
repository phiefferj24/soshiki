import type { MangaSourceType } from './manga/mangaSource';
import * as MangaSource from './manga/mangaSource';
import type { Medium } from "soshiki-types";
export type SourceType = MangaSourceType;
export class Source {
    name: string;
    id: string;
    version: string;
    type: SourceType;
    nsfw: number;
    image: string;
}
export async function install(medium: Medium, type: SourceType, json: any, url: string): Promise<Source> {
    switch(medium) {
        case 'manga':
            return await MangaSource.install(type, json, url);
    }
}