// @ts-check

/**
 * @constructor
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSValue
 *
 * TODO: add if needed
 */
export class CSSValue {
	// @see: http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSValue
	set cssText(text) {
		var name = this._getConstructorName();

		throw new Error(
			'DOMException: property "cssText" of "' + name +
				'" is readonly and can not be replaced with "' + text + '"!',
		);
	}

	get cssText() {
		var name = this._getConstructorName();

		throw new Error('getter "cssText" of "' + name + '" is not implemented!');
	}

	_getConstructorName() {
		var s = this.constructor.toString(),
			c = s.match(/function\s([^\(]+)/),
			// @ts-ignore
			name = c[1];

		return name;
	}
}
