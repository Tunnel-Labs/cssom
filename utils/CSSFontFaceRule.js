// @ts-check

import { CSSRule } from './CSSRule.js';
import { CSSStyleDeclaration } from './CSSStyleDeclaration.js';

/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#css-font-face-rule
 */
export class CSSFontFaceRule extends CSSRule {
	/** @type {CSSStyleDeclaration} */
	style;

	type = 5;

	constructor() {
		super();
		this.style = new CSSStyleDeclaration();
		this.style.parentRule = this;
	}

	// FIXME
	// CSSFontFaceRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
	// CSSFontFaceRule.prototype.deleteRule = CSSStyleSheet.prototype.deleteRule;
	get cssText() {
		return '@font-face {' + this.style.cssText + '}';
	}
}
