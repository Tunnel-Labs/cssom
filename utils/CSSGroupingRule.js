// @ts-check

import { CSSRule } from './CSSRule.js';
import { parse } from './parse.js';

/**
 * @constructor
 * @see https://drafts.csswg.org/cssom/#the-cssgroupingrule-interface
 */
export class CSSGroupingRule extends CSSRule {
	/** @type {Array<{cssText: string}>} */
	cssRules = []

	/**
	 * Used to insert a new CSS rule to a list of CSS rules.
	 *
	 * @example
	 *   cssGroupingRule.cssText
	 *   -> "body{margin:0;}"
	 *   cssGroupingRule.insertRule("img{border:none;}", 1)
	 *   -> 1
	 *   cssGroupingRule.cssText
	 *   -> "body{margin:0;}img{border:none;}"
	 *
	 * @param {string} rule
	 * @param {number} index
	 * @see https://www.w3.org/TR/cssom-1/#dom-cssgroupingrule-insertrule
	 * @return {number} The index within the grouping rule's collection of the newly inserted rule.
	 */
	insertRule(rule, index) {
		if (index < 0 || index > this.cssRules.length) {
			throw new RangeError('INDEX_SIZE_ERR');
		}
		var cssRule = parse(rule).cssRules[0];
		// @ts-ignore
		cssRule.parentRule = this;
		// @ts-ignore
		this.cssRules.splice(index, 0, cssRule);
		return index;
	}

	/**
	 * Used to delete a rule from the grouping rule.
	 *
	 *   cssGroupingRule.cssText
	 *   -> "img{border:none;}body{margin:0;}"
	 *   cssGroupingRule.deleteRule(0)
	 *   cssGroupingRule.cssText
	 *   -> "body{margin:0;}"
	 *
	 * @param {number} index within the grouping rule's rule list of the rule to remove.
	 * @see https://www.w3.org/TR/cssom-1/#dom-cssgroupingrule-deleterule
	 */
	deleteRule(index) {
		if (index < 0 || index >= this.cssRules.length) {
			throw new RangeError('INDEX_SIZE_ERR');
		}
		// @ts-ignore
		this.cssRules.splice(index, 1)[0].parentRule = null;
	}
}
