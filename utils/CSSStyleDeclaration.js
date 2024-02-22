// @ts-check

import { parse } from './parse.js';

/**
 * @constructor
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration
 */
export class CSSStyleDeclaration {
	length = 0;
	/** @type {import('./CSSRule.js').CSSRule | null} */
	parentRule = null;
	// NON-STANDARD
	_importants = {};

	/**
	 * @param {string} name
	 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-getPropertyValue
	 * @return {string} the value of the property if it has been explicitly set for this declaration block.
	 * Returns the empty string if the property has not been set.
	 */
	getPropertyValue(name) {
		// @ts-ignore
		return this[name] || '';
	}

	/**
	 * @param {string} name
	 * @param {string} value
	 * @param {string} [priority=null] "important" or null
	 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-setProperty
	 */
	setProperty(name, value, priority) {
		// @ts-ignore
		if (this[name]) {
			// Property already exist. Overwrite it.
			var index = Array.prototype.indexOf.call(this, name);
			if (index < 0) {
				// @ts-ignore
				this[this.length] = name;
				this.length++;
			}
		} else {
			// New property.
			// @ts-ignore
			this[this.length] = name;
			this.length++;
		}
		// @ts-ignore
		this[name] = value + '';
		// @ts-ignore
		this._importants[name] = priority;
	}

	/**
	 * @param {string} name
	 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-removeProperty
	 * @return {string} the value of the property if it has been explicitly set for this declaration block.
	 * Returns the empty string if the property has not been set or the property name does not correspond to a known CSS property.
	 */
	removeProperty(name) {
		if (!(name in this)) {
			return '';
		}
		var index = Array.prototype.indexOf.call(this, name);
		if (index < 0) {
			return '';
		}
		// @ts-ignore
		var prevValue = this[name];
		// @ts-ignore
		this[name] = '';

		// That's what WebKit and Opera do
		Array.prototype.splice.call(this, index, 1);

		// That's what Firefox does
		// this[index] = ""

		return prevValue;
	}

	getPropertyCSSValue() {
		// FIXME
	}

	/**
	 * @param {String} name
	 */
	getPropertyPriority(name) {
		// @ts-ignore
		return this._importants[name] || '';
	}

	/**
	 *   element.style.overflow = "auto"
	 *   element.style.getPropertyShorthand("overflow-x")
	 *   -> "overflow"
	 */
	getPropertyShorthand() {
		// FIXME
	}

	isPropertyImplicit() {
		// FIXME
	}

	// Doesn't work in IE < 9
	get cssText() {
		var properties = [];
		for (var i = 0, length = this.length; i < length; ++i) {
			// @ts-ignore
			var name = this[i];
			var value = this.getPropertyValue(name);
			var priority = this.getPropertyPriority(name);
			if (priority) {
				priority = ' !' + priority;
			}
			properties[i] = name + ': ' + value + priority + ';';
		}
		return properties.join(' ');
	}

	set cssText(text) {
		var i, name;
		for (i = this.length; i--;) {
			// @ts-ignore
			name = this[i];
			// @ts-ignore
			this[name] = '';
		}
		Array.prototype.splice.call(this, 0, this.length);
		this._importants = {};

		var dummyRule = parse('#bogus{' + text + '}').cssRules[0]?.style;
		var length = dummyRule.length;
		for (i = 0; i < length; ++i) {
			name = dummyRule[i];
			this.setProperty(
				dummyRule[i],
				dummyRule.getPropertyValue(name),
				dummyRule.getPropertyPriority(name),
			);
		}
	}
}
