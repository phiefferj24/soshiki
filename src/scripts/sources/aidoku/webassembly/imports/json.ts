import type { Imports } from "../imports";
import type { Wasm } from "../wasm";

export class Json implements Imports {
    getExports(): object {
        return {
            parse: this.parse,
        };
    }
    getNamespace(): string {
        return "json";
    }

    wasm: Wasm;
    constructor(wasm: Wasm) {
        this.wasm = wasm;
    }

    parse(data: number, length: number): number {
        if (length <= 0) { return -1; }

        let dataString = this.wasm.readString(data, length);
        let value = JSON.parse(dataString);
        return this.wasm.storeStdValue(value);
    }
}