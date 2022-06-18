import type { Imports } from '../imports';
import type { Wasm } from '../wasm';

export class Html implements Imports {
	getExports(): object {
		return {
			parse: this.parse,
			parse_fragment: this.parse_fragment,
			parse_with_uri: this.parse_with_uri,
			parse_fragment_with_uri: this.parse_fragment_with_uri,

			select: this.select,
			attr: this.attr,

			first: this.first,
			last: this.last,
			next: this.next,
			previous: this.previous,

			base_uri: this.base_uri,
			body: this.body,
			text: this.text,
			own_text: this.own_text,
			data: this.data,
			array: this.array,
			html: this.html,
			outer_html: this.outer_html,

			id: this.id,
			tag_name: this.tag_name,
			class_name: this.class_name,
			has_class: this.has_class,
			has_attr: this.has_attr
		};
	}
	getNamespace(): string {
		return 'html';
	}

	wasm: Wasm;
	constructor(wasm: Wasm) {
		this.wasm = wasm;
	}

	parse(data: number, length: number): number {
		if (length <= 0) {
			return -1;
		}

		let dataString = this.wasm.readString(data, length);
		let value = $.parseHTML(dataString)[0];
		return this.wasm.storeStdValue(value);
	}

	parse_fragment(data: number, length: number): number {
		if (length <= 0) {
			return -1;
		}

		let dataString = this.wasm.readString(data, length);
		let value = $.parseHTML(dataString);
		return this.wasm.storeStdValue(value);
	}

	parse_with_uri(data: number, length: number, uri: number, uriLength: number): number {
		if (length <= 0) {
			return -1;
		}

		let dataString = this.wasm.readString(data, length);
		let uriString = this.wasm.readString(uri, uriLength);
		let value = $.parseHTML(dataString)[0];
		let base = document.createElement('base');
		base.href = uriString;
		if ($(value).has('head')) {
			$(value).find('head').append(base);
		} else {
			$(value).prepend(base);
		}
		return this.wasm.storeStdValue(value);
	}

	parse_fragment_with_uri(data: number, length: number, uri: number, uriLength: number): number {
		if (length <= 0) {
			return -1;
		}

		let dataString = this.wasm.readString(data, length);
		let uriString = this.wasm.readString(uri, uriLength);
		let value = $.parseHTML(dataString);
		let outer = $.parseHTML('<html><head></head><body></body></html>')[0];
		let base = document.createElement('base');
		base.href = uriString;
		$(outer).find('head').append(base);
		for (let v of value) {
			$(outer).find('body').append(v);
		}
		return this.wasm.storeStdValue(outer);
	}

	select(descriptor: number, selector: number, selectorLength: number): number {
		if (selectorLength <= 0) {
			return -1;
		}

		let selectorString = this.wasm.readString(selector, selectorLength);
		let value = $(this.wasm.readStdValue(descriptor)).find(selectorString);
		return this.wasm.storeStdValue(value);
	}

	attr(descriptor: number, selector: number, selectorLength: number) {
		if (selectorLength <= 0) {
			return -1;
		}

		let selectorString = this.wasm.readString(selector, selectorLength);
		let value = $(this.wasm.readStdValue(descriptor)).attr(selectorString);
		return this.wasm.storeStdValue(value);
	}

	first(descriptor: number): number {
		let value = $(this.wasm.readStdValue(descriptor)).first();
		return this.wasm.storeStdValue(value);
	}

	last(descriptor: number): number {
		let value = $(this.wasm.readStdValue(descriptor)).last();
		return this.wasm.storeStdValue(value);
	}

	next(descriptor: number): number {
		let value = $(this.wasm.readStdValue(descriptor)).next();
		return this.wasm.storeStdValue(value);
	}

	previous(descriptor: number): number {
		let value = $(this.wasm.readStdValue(descriptor)).prev();
		return this.wasm.storeStdValue(value);
	}

	base_uri(descriptor: number): number {
		let value = $(this.wasm.readStdValue(descriptor));
		let base = value.find('base');
		if (base.length > 0) {
			return this.wasm.storeStdValue(base.attr('href'));
		} else {
			return this.wasm.storeStdValue('');
		}
	}

	body(descriptor: number): number {
		let value = $(this.wasm.readStdValue(descriptor));
		let body = value.find('body');
		if (body.length > 0) {
			return this.wasm.storeStdValue(body);
		} else {
			return this.wasm.storeStdValue(value);
		}
	}

	text(descriptor: number): number {
		let value = $(this.wasm.readStdValue(descriptor)).text();
		return this.wasm.storeStdValue(value);
	}

	own_text(descriptor: number): number {
		let v = $(this.wasm.readStdValue(descriptor));
		let value = $(v).contents().not(v.children()).text();
		return this.wasm.storeStdValue(value);
	}

	data(descriptor: number): number {
		let value = $(this.wasm.readStdValue(descriptor)).data();
		return this.wasm.storeStdValue(value);
	}

	array(descriptor: number): number {
		let value = $(this.wasm.readStdValue(descriptor)).toArray();
		return this.wasm.storeStdValue(value);
	}

	html(descriptor: number): number {
		let value = $(this.wasm.readStdValue(descriptor)).html();
		return this.wasm.storeStdValue(value);
	}

	outer_html(descriptor: number): number {
		let value = $(this.wasm.readStdValue(descriptor))[0].outerHTML;
		return this.wasm.storeStdValue(value);
	}

	id(descriptor: number): number {
		let value = $(this.wasm.readStdValue(descriptor)).attr('id');
		return this.wasm.storeStdValue(value);
	}

	tag_name(descriptor: number): number {
		let value = $(this.wasm.readStdValue(descriptor)).prop('tagName');
		return this.wasm.storeStdValue(value);
	}

	class_name(descriptor: number): number {
		let value = $(this.wasm.readStdValue(descriptor)).attr('class');
		return this.wasm.storeStdValue(value);
	}

	has_class(descriptor: number, className: number, classLength: number): number {
		if (classLength <= 0) {
			return -1;
		}

		let classString = this.wasm.readString(className, classLength);
		let value = $(this.wasm.readStdValue(descriptor)).hasClass(classString);
		return value ? 1 : 0;
	}

	has_attr(descriptor: number, attribute: number, attributeLength: number): number {
		if (attributeLength <= 0) {
			return -1;
		}

		let attributeString = this.wasm.readString(attribute, attributeLength);
		let value = $(this.wasm.readStdValue(descriptor)).attr(attributeString);
		return value ? 1 : 0;
	}
}
