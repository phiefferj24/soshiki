import { Wasm } from "../wasm";
import { Imports } from "../imports";
import { Optional } from "../../models/optional";
export class Aidoku implements Imports {
    wasm: Wasm;
    constructor(wasm: Wasm) {
        this.wasm = wasm;
    }

    getNamespace(): string {
        return "aidoku";
    }
    getExports(): object {
        return {
            create_manga: this.create_manga,
            create_manga_result: this.create_manga_result,
            create_chapter: this.create_chapter,
            create_page: this.create_page,
            create_deeplink: this.create_deeplink,
        }
    }

    create_manga(
        id: number, 
        idLen: number, 
        coverUrl: number, 
        coverUrlLen: number, 
        title: number, 
        titleLen: number, 
        author: number, 
        authorLen: number, 
        artist: number, 
        artistLen: number, 
        description: number,
        descriptionLen: number,
        url: number,
        urlLen: number,
        tags: number,
        tagsStrLens: number,
        tagCount: number,
        status: number,
        nsfw: number,
        viewer: number
    ): number {
        if(idLen <= 0) { return -1 }


    }
}