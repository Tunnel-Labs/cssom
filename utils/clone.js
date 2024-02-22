// @ts-check

import { CSSStyleDeclaration } from './CSSStyleDeclaration.js';
import { CSSStyleSheet } from './CSSStyleSheet.js';

/**
 * Produces a deep copy of stylesheet — the instance variables of stylesheet are copied recursively.
 * @param {CSSStyleSheet|CSSStyleSheet} stylesheet
 * @nosideeffects
 * @return {CSSStyleSheet}
 */
export function clone(stylesheet) {
	var cloned = new CSSStyleSheet();

	var rules = stylesheet.cssRules;
	if (!rules) {
		return cloned;
	}

	for (var i = 0, rulesLength = rules.length; i < rulesLength; i++) {
		var rule = rules[i];
		// @ts-ignore
		var ruleClone = cloned.cssRules[i] = new rule();

		// @ts-ignore
		var style = rule.style;
		if (style) {
			var styleClone = ruleClone.style = new CSSStyleDeclaration();
			for (var j = 0, styleLength = style.length; j < styleLength; j++) {
				// @ts-ignore
				var name = styleClone[j] = style[j];
				// @ts-ignore
				styleClone[name] = style[name];
				// @ts-ignore
				styleClone._importants[name] = style.getPropertyPriority(name);
			}
			styleClone.length = style.length;
		}

		// @ts-ignore
		if (rule.hasOwnProperty('keyText')) {
			// @ts-ignore
			ruleClone.keyText = rule.keyText;
		}

		// @ts-ignore
		if (rule.hasOwnProperty('selectorText')) {
			// @ts-ignore
			ruleClone.selectorText = rule.selectorText;
		}

		// @ts-ignore
		if (rule.hasOwnProperty('mediaText')) {
			// @ts-ignore
			ruleClone.mediaText = rule.mediaText;
		}

		// @ts-ignore
		if (rule.hasOwnProperty('conditionText')) {
			// @ts-ignore
			ruleClone.conditionText = rule.conditionText;
		}

		// @ts-ignore
		if (rule.hasOwnProperty('cssRules')) {
			// @ts-ignore
			ruleClone.cssRules = clone(rule).cssRules;
		}
	}

	return cloned;
}
