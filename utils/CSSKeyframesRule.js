// @ts-check

import { CSSRule } from './CSSRule.js';

/**
 * @constructor
 * @see http://www.w3.org/TR/css3-animations/#DOM-CSSKeyframesRule
 */
export class CSSKeyframesRule extends CSSRule {
	type = 7;
	name = '';
	/** @type {Array<{ cssText: string }>} */
	cssRules = [];
	/** @type {string | undefined} */
	_vendorPrefix;

	// FIXME
	// CSSKeyframesRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
	// CSSKeyframesRule.prototype.deleteRule = CSSStyleSheet.prototype.deleteRule;

	// http://www.opensource.apple.com/source/WebCore/WebCore-955.66.1/css/WebKitCSSKeyframesRule.cpp
	get cssText() {
		var cssTexts = [];
		for (var i = 0, length = this.cssRules.length; i < length; i++) {
			cssTexts.push('  ' + this.cssRules[i]?.cssText);
		}
		return '@' + (this._vendorPrefix || '') + 'keyframes ' + this.name +
			' { \n' + cssTexts.join('\n') + '\n}';
	}
}
