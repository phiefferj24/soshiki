import { Aidoku, Defaults, Html, Json, Net, Std } from './imports/index';
import type { Optional } from '../models/optional';
import type { RequestObject } from './imports/net';

export class Wasm {
	instance: WebAssembly.Instance;
	sourceId: string;
	constructor(url: string) {
		let imports: WebAssembly.Imports = {} as WebAssembly.Imports;
		let aidokuImports = new Aidoku(this);
		let defaultsImports = new Defaults(this);
		let htmlImports = new Html(this);
		let jsonImports = new Json(this);
		let netImports = new Net(this);
		let stdImports = new Std(this);
		Object.defineProperty(imports, aidokuImports.getNamespace(), aidokuImports.getExports());
		Object.defineProperty(imports, defaultsImports.getNamespace(), defaultsImports.getExports());
		Object.defineProperty(imports, htmlImports.getNamespace(), htmlImports.getExports());
		Object.defineProperty(imports, jsonImports.getNamespace(), jsonImports.getExports());
		Object.defineProperty(imports, netImports.getNamespace(), netImports.getExports());
		Object.defineProperty(imports, stdImports.getNamespace(), stdImports.getExports());
		this.instance = new WebAssembly.Instance(WebAssembly.compileStreaming(fetch(url)), imports);
		this.sourceId = url;
	}

	chapterCounter = 0;
	currentManga = '';

	stdDescriptorPointer = -1;
	stdDescriptors: Map<number, any> = new Map();
	stdReferences: Map<number, number[]> = new Map();

	requestsPointer = -1;
	requests: Map<number, RequestObject> = new Map();

	readStdValue(ptr: number): any {
		return this.stdDescriptors.get(ptr);
	}

	storeStdValue(value: any, from: Optional<number> = null): number {
		this.stdDescriptorPointer++;
		this.stdDescriptors.set(this.stdDescriptorPointer, value);
		if (from) {
			let references = this.stdReferences.get(from);
			if (references) {
				references.push(this.stdDescriptorPointer);
				this.stdReferences.set(from, references);
			}
		}
		return this.stdDescriptorPointer;
	}

	removeStdValue(ptr: number): void {
		this.stdDescriptors.delete(ptr);
		let references = this.stdReferences.get(ptr);
		if (references) {
			references.forEach((ref) => {
				this.removeStdValue(ref);
			});
			this.stdReferences.delete(ptr);
		}
	}

	addStdReference(ptr: number, reference: number): void {
		let references = this.stdReferences.get(ptr) ?? [];
		references.push(reference);
		this.stdReferences.set(ptr, references);
	}

	readString(ptr: number, len: number): string {
		const buffer = (this.instance.exports.memory as any).buffer;
		const bytes = new Uint8Array(buffer, ptr, len);
		return String.fromCharCode(...bytes);
	}
	readBytes(ptr: number, len: number): Uint8Array {
		const buffer = (this.instance.exports.memory as any).buffer;
		return new Uint8Array(buffer, ptr, len);
	}
	writeString(ptr: number, str: string): void {
		const buffer = (this.instance.exports.memory as any).buffer;
		const bytes = new Uint8Array(buffer, ptr, str.length);
		for (let i = 0; i < str.length; i++) {
			bytes[i] = str.charCodeAt(i);
		}
	}
	writeBytes(ptr: number, bytes: Uint8Array): void {
		const buffer = (this.instance.exports.memory as any).buffer;
		const dest = new Uint8Array(buffer, ptr, bytes.length);
		for (let i = 0; i < bytes.length; i++) {
			dest[i] = bytes[i];
		}
	}
}
