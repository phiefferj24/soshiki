import { validate_each_argument } from "svelte/internal";
import type { Imports } from "../imports";
import type { Wasm } from "../wasm";

class Html implements Imports {
    getExports(): object {
        throw new Error("Method not implemented.");
    }
    getNamespace(): string {
        return "html";
    }
    
    wasm: Wasm;
    constructor(wasm: Wasm) {
        this.wasm = wasm;
    }

    parse(data: number, length: number): number {
        if (length <= 0) { return -1; }

        let dataString = this.wasm.readString(data, length);
        let value = $.parseHTML(dataString)[0];
        return this.wasm.storeStdValue(value);
    }

    parse_fragment(data: number, length: number): number {
        if (length <= 0) { return -1; }

        let dataString = this.wasm.readString(data, length);
        let value = $.parseHTML(dataString);
        let outer =$.parseHTML("<html><head></head><body></body></html>")[0];
        for(let v of value) {
            outer.appendChild(v);
        }
        return this.wasm.storeStdValue(outer);
    }

    parse_with_uri(data: number, length: number, uri: number, uriLength: number): number {
        if (length <= 0) { return -1; }

        let dataString = this.wasm.readString(data, length);
        let uriString = this.wasm.readString(uri, uriLength);
        let value = $.parseHTML(dataString)[0];
        let base = document.createElement("base");
        base.href = uriString;
        $(value).find("head").append(base);
        return this.wasm.storeStdValue(value);
    }

    parse_fragment_with_uri(data: number, length: number, uri: number, uriLength: number): number {
        if (length <= 0) { return -1; }

        let dataString = this.wasm.readString(data, length);
        let uriString = this.wasm.readString(uri, uriLength);
        let value = $.parseHTML(dataString);
        let outer = $.parseHTML("<html><head></head><body></body></html>")[0];
        let base = document.createElement("base");
        base.href = uriString;
        $(outer).find("head").append(base);
        for(let v of value) {
            outer.appendChild(v);
        }
        return this.wasm.storeStdValue(outer);
    }

    select(descriptor: number, selector: number, selectorLength: number): number {
        if (selectorLength <= 0) { return -1; }

        let selectorString = this.wasm.readString(selector, selectorLength);
        let value = $(this.wasm.readStdValue(descriptor)).find(selectorString);
        return this.wasm.storeStdValue(value);
    }

    attr(descriptor: number, selector: number, selectorLength: number) {
        if (selectorLength <= 0) { return -1; }

        let selectorString = this.wasm.readString(selector, selectorLength);
        let value = $(this.wasm.readStdValue(descriptor)).attr(selectorString);
        return this.wasm.storeStdValue(value);
    }

    first(descriptor: number): number {
        let value = $(this.wasm.readStdValue(descriptor)).first();
        return this.wasm.storeStdValue(value);
    }
}