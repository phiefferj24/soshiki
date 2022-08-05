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

export interface Filter {
    name: string;
    type: FilterType;
    value?: string | string[];
}

export enum FilterType {
    text,
    singleSelect,
    multiSelect,
    sort
}

export class TextFilter implements Filter {
    name: string;
    type = FilterType.text;
    value: string;
    constructor(name: string, value: string = "") {
        this.name = name;
        this.value = value;
    }
}

export class SingleSelectFilter implements Filter {
    name: string;
    type = FilterType.singleSelect;
    value: string[];
    ids?: any[];
    index: number;
    canExclude: boolean;
    excluding: boolean;
    constructor(name: string, value: string[], canExclude: boolean, ids?: any[], index: number = -1, excluding: boolean = false) {
        this.name = name;
        this.value = value;
        this.canExclude = canExclude;
        this.ids = ids;
        this.index = index;
        this.excluding = excluding;
    }
}

export class MultiSelectFilter implements Filter {
    name: string;
    type = FilterType.multiSelect;
    value: string[];
    ids?: any[];
    indices: number[];
    canExclude: boolean;
    excludings: number[];
    constructor(name: string, value: string[], canExclude: boolean, ids?: any[], indices: number[] = [], excludings: number[] = []) {
        this.name = name;
        this.value = value;
        this.canExclude = canExclude;
        this.ids = ids;
        this.indices = indices;
        this.excludings = excludings;
    }
}

export class SortFilter implements Filter {
    name: string;
    type = FilterType.sort;
    value: string[];
    ids?: any[];
    index: number;
    canAscend: boolean;
    ascending: boolean;
    constructor(name: string, value: string[], canAscend: boolean, ids?: any[], index: number = -1, ascending: boolean = false) {
        this.name = name;
        this.value = value;
        this.canAscend = canAscend;
        this.ids = ids;
        this.index = index;
        this.ascending = ascending;
    }
}

export class Listing {
    name: string;
    id: string;

    constructor(name: string, id: string) {
        this.name = name;
        this.id = id;
    }
}