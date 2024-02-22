// @ts-check

import { CSSRule } from './CSSRule.js';

/**
 * @constructor
 * @see http://www.w3.org/TR/shadow-dom/#host-at-rule
 */
export class CSSHostRule extends CSSRule {
	type = 1001;
	/** @type {Array<{cssText: string}>} */
	cssRules = [];

	// FIXME
	// CSSHostRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
	// CSSHostRule.prototype.deleteRule = CSSStyleSheet.prototype.deleteRule;
	get cssText() {
		var cssTexts = [];
		for (var i = 0, length = this.cssRules.length; i < length; i++) {
			cssTexts.push(this.cssRules[i]?.cssText);
		}
		return '@host {' + cssTexts.join('') + '}';
	}
}
