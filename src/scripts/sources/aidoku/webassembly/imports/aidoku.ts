import type { Wasm } from '../wasm';
import type { Imports } from '../imports';
export class Aidoku implements Imports {
	wasm: Wasm;
	constructor(wasm: Wasm) {
		this.wasm = wasm;
	}

	getNamespace(): string {
		return 'aidoku';
	}
	getExports(): object {
		return {
			create_manga: this.create_manga,
			create_manga_result: this.create_manga_result,
			create_chapter: this.create_chapter,
			create_page: this.create_page,
			create_deeplink: this.create_deeplink
		};
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
		if (idLen <= 0) {
			return -1;
		}
		let idString = this.wasm.readString(id, idLen);
		let tagList: string[] = [];
		let tagBytes = this.wasm.readBytes(tags, tagCount * 4);
		let tagLengthBytes = this.wasm.readBytes(tagsStrLens, tagCount * 4);
		for (let i = 0; i < tagCount * 4; i += 4) {
			let tag = this.wasm.readString(
				new Uint32Array(tagBytes.slice(i, i + 4))[0],
				new Uint32Array(tagLengthBytes.slice(i, i + 4))[0]
			);
			tagList.push(tag);
		}
		let manga = new Manga(
			this.wasm.sourceId,
			idString,
			titleLen > 0 ? this.wasm.readString(title, titleLen) : '',
			authorLen > 0 ? this.wasm.readString(author, authorLen) : '',
			artistLen > 0 ? this.wasm.readString(artist, artistLen) : '',
			descriptionLen > 0 ? this.wasm.readString(description, descriptionLen) : '',
			tagList,
			coverUrlLen > 0 ? this.wasm.readString(coverUrl, coverUrlLen) : '',
			urlLen > 0 ? this.wasm.readString(url, urlLen) : '',
			status,
			nsfw,
			viewer
		);
		return this.wasm.storeStdValue(manga);
	}

	create_manga_result(mangaArray: number, hasMore: number) {
		let mangaList = this.wasm.readStdValue(mangaArray) as Manga[];
		let result = this.wasm.storeStdValue(new MangaPageResult(mangaList, hasMore != 0));
		this.wasm.addStdReference(result, mangaArray);
		return result;
	}

	create_chapter(
		id: number,
		idLen: number,
		name: number,
		nameLen: number,
		volume: number,
		chapter: number,
		dateUploaded: number,
		scanlator: number,
		scanlatorLen: number,
		url: number,
		urlLen: number,
		lang: number,
		langLen: number
	) {
		if (idLen <= 0) {
			return -1;
		}
		let chapterId = this.wasm.readString(id, idLen);
		let chapterobj = new Chapter(
			this.wasm.sourceId,
			chapterId,
			this.wasm.currentManga,
			nameLen > 0 ? this.wasm.readString(name, nameLen) : '',
			scanlatorLen > 0 ? this.wasm.readString(scanlator, scanlatorLen) : '',
			urlLen > 0 ? this.wasm.readString(url, urlLen) : '',
			langLen > 0 ? this.wasm.readString(lang, langLen) : '',
			chapter,
			volume,
			new Date(dateUploaded),
			this.wasm.chapterCounter
		);
		this.wasm.chapterCounter++;
		return this.wasm.storeStdValue(chapterobj);
	}

	create_page(
		index: number,
		imageUrl: number,
		imageUrlLen: number,
		base64: number,
		base64Len: number,
		text: number,
		textLen: number
	) {
		return this.wasm.storeStdValue(
			new Page(
				index,
				imageUrlLen > 0 ? this.wasm.readString(imageUrl, imageUrlLen) : '',
				base64Len > 0 ? this.wasm.readString(base64, base64Len) : '',
				textLen > 0 ? this.wasm.readString(text, textLen) : ''
			)
		);
	}

	create_deeplink(manga: number, chapter: number) {
		return this.wasm.storeStdValue(
			new DeepLink(
				this.wasm.readStdValue(manga) as Manga,
				this.wasm.readStdValue(chapter) as Chapter
			)
		);
	}
}
