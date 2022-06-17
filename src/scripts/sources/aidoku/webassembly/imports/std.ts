import moment from "moment-timezone";
import type { Imports } from "../imports";
import type { Wasm } from "../wasm";

export enum ObjectType {
    null = 0,
    int = 1,
    float = 2,
    string = 3,
    bool = 4,
    array = 5,
    object = 6,
    date = 7,
    node = 8,
    unknown = 9,
}

export class Std implements Imports {
    getExports(): object {
        return {
            copy: this.copy,
            destroy: this.destroy,

            create_null: this.create_null,
            create_int: this.create_int,
            create_float: this.create_float,
            create_string: this.create_string,
            create_bool: this.create_bool,
            create_array: this.create_array,
            create_object: this.create_object,
            create_date: this.create_date,

            typeof: this.typeof,
            string_len: this.string_len,
            read_string: this.read_string,
            read_int: this.read_int,
            read_float: this.read_float,
            read_bool: this.read_bool,
            read_date: this.read_date,
            read_date_string: this.read_date_string,

            object_len: this.object_len,
            object_get: this.object_get,
            object_set: this.object_set,
            object_remove: this.object_remove,
            object_keys: this.object_keys,
            object_values: this.object_values,

            array_len: this.array_len,
            array_get: this.array_get,
            array_set: this.array_set,
            array_append: this.array_append,
            array_remove: this.array_remove,
        };
    }
    getNamespace(): string {
        return "std";
    }
    
    wasm: Wasm;
    constructor(wasm: Wasm) {
        this.wasm = wasm;
    }
    
    copy(descriptor: number): number {
        if (descriptor < 0) { return -1; }
        return this.wasm.storeStdValue(this.wasm.readStdValue(descriptor));
    }

    destroy(descriptor: number): void {
        if (descriptor < 0) { return; }
        this.wasm.removeStdValue(descriptor);
    }

    create_null(): number {
        return this.wasm.storeStdValue(null);
    }

    create_int(int: number): number {
        return this.wasm.storeStdValue(int);
    }

    create_float(float: number): number {
        return this.wasm.storeStdValue(float);
    }

    create_string(string: number, length: number): number {
        if (length <= 0) { return -1; }
        let stringString = this.wasm.readString(string, length);
        return this.wasm.storeStdValue(stringString);
    }

    create_bool(bool: number): number {
        return this.wasm.storeStdValue(bool != 0);
    }

    create_object(): number {
        return this.wasm.storeStdValue({});
    }

    create_array(): number {
        return this.wasm.storeStdValue([]);
    }

    create_date(date: number): number {
        return this.wasm.storeStdValue(date < 0 ? new Date() : new Date(date));
    }

    typeof(descriptor: number): number {
        if (descriptor < 0) { return ObjectType.null }
        let value = this.wasm.readStdValue(descriptor);
        if (value === null) { return ObjectType.null; }
        switch(typeof value) {
            case "number":
                if (Number.isInteger(value)) { return ObjectType.int; }
                return ObjectType.float;
            case "string":
                return ObjectType.string;
            case "boolean":
                return ObjectType.bool;
            case "object":
                if (value instanceof Array) { return ObjectType.array; }
                if (value instanceof Date) { return ObjectType.date; }
                if (value instanceof Node) { return ObjectType.node; }
                return ObjectType.object;
            default:
                return ObjectType.unknown;
        }
    }

    string_len(descriptor: number): number {
        if (descriptor < 0) { return -1; }
        let value = this.wasm.readStdValue(descriptor);
        if (value === null) { return -1; }
        return value.length;
    }

    read_string(descriptor: number, buffer: number, size: number): void {
        if (descriptor < 0 || size < 0) { return; }
        let value = this.wasm.readStdValue(descriptor);
        if (value === null) { return; }
        if (typeof value !== "string") { return; }
        if (size <= value.length) { 
            this.wasm.writeString(buffer, value.substring(0, size));
        }
    }

    read_int(descriptor: number): number {
        if (descriptor < 0) { return -1; }
        let value = this.wasm.readStdValue(descriptor);
        if (typeof value === "number") {
            if (Number.isInteger(value)) { return value; }
            return Math.floor(value);
        }
        if (typeof value === "boolean") { return value ? 1 : 0; }
        if (typeof value === "string") { return parseInt(value); }
        return -1;
    }

    read_float(descriptor: number): number {
        if (descriptor < 0) { return -1; }
        let value = this.wasm.readStdValue(descriptor);
        if (typeof value === "number") {
            if (Number.isInteger(value)) { return value; }
            return value;
        }
        if (typeof value === "string") { return parseFloat(value); }
        return -1;
    }
    
    read_bool(descriptor: number): number {
        if (descriptor < 0) { return -1; }
        let value = this.wasm.readStdValue(descriptor);
        if (typeof value === "boolean" || typeof value === "number") { return value ? 1 : 0; }
        return 0;
    }

    read_date(descriptor: number): number {
        if (descriptor < 0) { return -1; }
        let value = this.wasm.readStdValue(descriptor);
        if (typeof value === "number") { return value; }
        if (typeof value === "object" && value instanceof Date) { return value.getTime(); }
        return -1;
    }

    read_date_string(descriptor: number, format: number, formatLen: number, locale: number, localeLen: number, timeZone: number, timeZoneLen: number): number {
        if (descriptor < 0 || formatLen <= 0) { return -1; }
        let value = this.wasm.readStdValue(descriptor);
        if (typeof value !== "string") { return -1; }
        let formatString = this.wasm.readString(format, formatLen);
        let localeString = localeLen > 0 ? this.wasm.readString(locale, localeLen) : undefined;
        let timeZoneString = timeZoneLen > 0 ? this.wasm.readString(timeZone, timeZoneLen) : undefined;
        let time = moment(value, formatString, localeString);
        if (timeZoneString) { time = time.tz(timeZoneString); }
        return time.valueOf();
    }

    object_len(descriptor: number): number {
        if (descriptor < 0) { return -1; }
        let value = this.wasm.readStdValue(descriptor);
        if (typeof value !== "object") { return -1; }
        return Object.keys(value).length;
    }

    object_get(descriptor: number, key: number, keyLen: number): number {
        if (descriptor < 0 || keyLen <= 0) { return -1; }
        let value = this.wasm.readStdValue(descriptor);
        if (typeof value !== "object") { return -1; }
        let keyString = this.wasm.readString(key, keyLen);
        return this.wasm.storeStdValue(value[keyString]);
    }

    object_set(descriptor: number, key: number, keyLen: number, value: number): void {
        if (descriptor < 0 || keyLen < 0 || value < 0) { return; }
        let object = this.wasm.readStdValue(descriptor);
        if (typeof object !== "object") { return; }
        let keyString = this.wasm.readString(key, keyLen);
        object[keyString] = this.wasm.readStdValue(value);
        this.wasm.stdDescriptors.set(descriptor, object);
        this.wasm.addStdReference(descriptor, value);
    }

    object_remove(descriptor: number, key: number, keyLen: number): void {
        if (descriptor < 0 || keyLen < 0) { return; }
        let object = this.wasm.readStdValue(descriptor);
        if (typeof object !== "object") { return; }
        let keyString = this.wasm.readString(key, keyLen);
        delete object[keyString];
        this.wasm.stdDescriptors.set(descriptor, object);
    }

    object_keys(descriptor: number): number {
        if (descriptor < 0) { return -1; }
        let value = this.wasm.readStdValue(descriptor);
        if (typeof value !== "object") { return -1; }
        let keys = Object.keys(value);
        return this.wasm.storeStdValue(keys, descriptor);
    }

    object_values(descriptor: number): number {
        if (descriptor < 0) { return -1; }
        let value = this.wasm.readStdValue(descriptor);
        if (typeof value !== "object") { return -1; }
        let values = Object.values(value);
        return this.wasm.storeStdValue(values, descriptor);
    }

    array_len(descriptor: number): number {
        if (descriptor < 0) { return -1; }
        let value = this.wasm.readStdValue(descriptor);
        if (typeof value !== "object") { return -1; }
        return value.length;
    }

    array_get(descriptor: number, index: number): number {
        if (descriptor < 0 || index < 0) { return -1; }
        let value = this.wasm.readStdValue(descriptor);
        if (typeof value !== "object") { return -1; }
        return this.wasm.storeStdValue(value[index], descriptor);
    }

    array_set(descriptor: number, index: number, value: number): void {
        if (descriptor < 0 || index < 0 || value < 0) { return; }
        let array = this.wasm.readStdValue(descriptor);
        if (typeof array !== "object") { return; }
        array[index] = this.wasm.readStdValue(value);
        this.wasm.stdDescriptors.set(descriptor, array);
        this.wasm.addStdReference(descriptor, value);
    }

    array_append(descriptor: number, value: number): void {
        if (descriptor < 0 || value < 0) { return; }
        let array = this.wasm.readStdValue(descriptor);
        if (typeof array !== "object") { return; }
        array.push(this.wasm.readStdValue(value));
        this.wasm.stdDescriptors.set(descriptor, array);
        this.wasm.addStdReference(descriptor, value);
    }

    array_remove(descriptor: number, index: number): void {
        if (descriptor < 0 || index < 0) { return; }
        let array = this.wasm.readStdValue(descriptor);
        if (typeof array !== "object") { return; }
        array.splice(index, 1);
        this.wasm.stdDescriptors.set(descriptor, array);
    }
}