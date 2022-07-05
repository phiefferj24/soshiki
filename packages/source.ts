import type { MangaSourceType } from './manga/mangaSource';
import * as MangaSource from './manga/mangaSource';
export type SourceType = MangaSourceType;
export class Source {
    name: string;
    id: string;
    version: string;
    type: SourceType;
    nsfw: number;
    image: string;
}
export async function install(medium: 'manga' | 'anime' | 'novel', type: SourceType, url: string): Promise<Source> {
    switch(medium) {
        case 'manga':
            return await MangaSource.install(type, url);
    }
}