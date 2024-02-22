// @ts-check

import { CSSRule } from './CSSRule.js';
import { MatcherList } from './MatcherList.js';

/**
 * @constructor
 * @see https://developer.mozilla.org/en/CSS/@-moz-document
 */
export class CSSDocumentRule extends CSSRule {
	type = 10;
	/** @type {Array<{cssText: string}>} */
	cssRules = []
	matcher = new MatcherList();

	// FIXME
	// CSSDocumentRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
	// CSSDocumentRule.prototype.deleteRule = CSSStyleSheet.prototype.deleteRule;

	get cssText() {
		var cssTexts = [];
		for (var i = 0, length = this.cssRules.length; i < length; i++) {
			cssTexts.push(this.cssRules[i]?.cssText ?? '');
		}
		return '@-moz-document ' + this.matcher.matcherText + ' {' +
			cssTexts.join('') + '}';
	}
}
