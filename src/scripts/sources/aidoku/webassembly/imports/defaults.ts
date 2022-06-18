import type { Wasm } from '../wasm';
import type { Imports } from '../imports';

export class Defaults implements Imports {
	getExports(): object {
		return {
			get: this.get,
			set: this.set
		};
	}
	getNamespace(): string {
		return 'defaults';
	}

	wasm: Wasm;
	constructor(wasm: Wasm) {
		this.wasm = wasm;
	}

	get(key: number, length: number): number {
		if (length <= 0) {
			return -1;
		}

		let keyString = this.wasm.readString(key, length);
		let value = localStorage.getItem(keyString);
		if (value) {
			return this.wasm.storeStdValue(value);
		}
		return -1;
	}

	set(key: number, length: number, value: number): void {
		if (length <= 0 || value < 0) {
			return;
		}

		let keyString = this.wasm.readString(key, length);
		let valueString = this.wasm.readStdValue(value);
		localStorage.setItem(keyString, valueString);
	}
}
