// @ts-check

import { parse } from './parse.js';
import { StyleSheet } from './StyleSheet.js';

/**
 * @constructor
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet
 */
export class CSSStyleSheet extends StyleSheet {
	/** @type {Array<{ cssText: string, parentStyleSheet: CSSStyleSheet, style: any }>} */
	cssRules = []

	/**
	 * Used to insert a new rule into the style sheet. The new rule now becomes part of the cascade.
	 *
	 *   sheet = new Sheet("body {margin: 0}")
	 *   sheet.toString()
	 *   -> "body{margin:0;}"
	 *   sheet.insertRule("img {border: none}", 0)
	 *   -> 0
	 *   sheet.toString()
	 *   -> "img{border:none;}body{margin:0;}"
	 *
	 * @param {string} rule
	 * @param {number} index
	 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet-insertRule
	 * @return {number} The index within the style sheet's rule collection of the newly inserted rule.
	 */
	insertRule(rule, index) {
		if (index < 0 || index > this.cssRules.length) {
			throw new RangeError('INDEX_SIZE_ERR');
		}
		var cssRule = parse(rule).cssRules[0];
		if (cssRule === undefined) throw new SyntaxError('SYNTAX_ERR');
		cssRule.parentStyleSheet = this;
		this.cssRules.splice(index, 0, cssRule);
		return index;
	}

	/**
	 * Used to delete a rule from the style sheet.
	 *
	 *   sheet = new Sheet("img{border:none} body{margin:0}")
	 *   sheet.toString()
	 *   -> "img{border:none;}body{margin:0;}"
	 *   sheet.deleteRule(0)
	 *   sheet.toString()
	 *   -> "body{margin:0;}"
	 *
	 * @param {number} index within the style sheet's rule list of the rule to remove.
	 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet-deleteRule
	 */
	deleteRule(index) {
		if (index < 0 || index >= this.cssRules.length) {
			throw new RangeError('INDEX_SIZE_ERR');
		}
		this.cssRules.splice(index, 1);
	}

	/**
	 * NON-STANDARD
	 * @return {string} serialize stylesheet
	 */
	toString() {
		var result = '';
		var rules = this.cssRules;
		for (var i = 0; i < rules.length; i++) {
			result += rules[i]?.cssText + '\n';
		}
		return result;
	}
}
