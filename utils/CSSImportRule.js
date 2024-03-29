// @ts-check

import { CSSRule } from './CSSRule.js';
import { CSSStyleSheet } from './CSSStyleSheet.js';
import { MediaList } from './MediaList.js';

/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#cssimportrule
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSImportRule
 */
export class CSSImportRule extends CSSRule {
	type = 3;
	href = '';
	media = new MediaList();
	styleSheet = new CSSStyleSheet();

	get cssText() {
		var mediaText = this.media.mediaText;
		return '@import url(' + this.href + ')' +
			(mediaText ? ' ' + mediaText : '') + ';';
	}

	set cssText(cssText) {
		var i = 0;

		/**
		 * @import url(partial.css) screen, handheld;
		 *        ||               |
		 *        after-import     media
		 *         |
		 *         url
		 */
		var state = '';

		var buffer = '';
		var index;
		for (var character; (character = cssText.charAt(i)); i++) {
			switch (character) {
				case ' ':
				case '\t':
				case '\r':
				case '\n':
				case '\f':
					if (state === 'after-import') {
						state = 'url';
					} else {
						buffer += character;
					}
					break;

				case '@':
					if (!state && cssText.indexOf('@import', i) === i) {
						state = 'after-import';
						i += 'import'.length;
						buffer = '';
					}
					break;

				case 'u':
					if (state === 'url' && cssText.indexOf('url(', i) === i) {
						index = cssText.indexOf(')', i + 1);
						if (index === -1) {
							throw i + ': ")" not found';
						}
						i += 'url('.length;
						var url = cssText.slice(i, index);
						if (url[0] === url[url.length - 1]) {
							if (url[0] === '"' || url[0] === "'") {
								url = url.slice(1, -1);
							}
						}
						this.href = url;
						i = index;
						state = 'media';
					}
					break;

				case '"':
					if (state === 'url') {
						index = cssText.indexOf('"', i + 1);
						if (!index) {
							throw i + ": '\"' not found";
						}
						this.href = cssText.slice(i + 1, index);
						i = index;
						state = 'media';
					}
					break;

				case "'":
					if (state === 'url') {
						index = cssText.indexOf("'", i + 1);
						if (!index) {
							throw i + ': "\'" not found';
						}
						this.href = cssText.slice(i + 1, index);
						i = index;
						state = 'media';
					}
					break;

				case ';':
					if (state === 'media') {
						if (buffer) {
							this.media.mediaText = buffer.trim();
						}
					}
					break;

				default:
					if (state === 'media') {
						buffer += character;
					}
					break;
			}
		}
	}
}
