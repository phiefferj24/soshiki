import { Aidoku } from "./imports/index";
import type { Optional } from "../models/optional";
import type { RequestObject } from "./imports/net";

export class Wasm {
    instance: WebAssembly.Instance;
    constructor(file: string) {
        let imports: WebAssembly.Imports = {} as WebAssembly.Imports;
        let aidokuImports = new Aidoku(this);
        Object.defineProperty(imports, aidokuImports.getNamespace(), aidokuImports.getExports());
        this.instance = new WebAssembly.Instance(WebAssembly.compileStreaming(fetch(file)), imports);
    }

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
            references.forEach(ref => {
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