// @ts-check

import { CSSRule } from './CSSRule.js';
import { CSSStyleDeclaration } from './CSSStyleDeclaration.js';

/**
 * @constructor
 * @see http://www.w3.org/TR/css3-animations/#DOM-CSSKeyframeRule
 */
export class CSSKeyframeRule extends CSSRule {
	type = 8;
	keyText = '';
	/** @type {CSSStyleDeclaration} */
	style;

	constructor() {
		super();
		this.style = new CSSStyleDeclaration();
		this.style.parentRule = this;
	}

	// http://www.opensource.apple.com/source/WebCore/WebCore-955.66.1/css/WebKitCSSKeyframeRule.cpp
	get cssText() {
		return this.keyText + ' {' + this.style.cssText + '} ';
	}

	// FIXME
	// CSSKeyframeRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
	// CSSKeyframeRule.prototype.deleteRule = CSSStyleSheet.prototype.deleteRule;
}
