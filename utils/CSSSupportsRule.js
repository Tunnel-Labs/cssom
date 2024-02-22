// @ts-check

import { CSSConditionRule } from './CSSConditionRule.js';

/**
 * @constructor
 * @see https://drafts.csswg.org/css-conditional-3/#the-csssupportsrule-interface
 */
export class CSSSupportsRule extends CSSConditionRule {
	type = 12;

	// @ts-ignore
	get cssText() {
		var cssTexts = [];

		for (var i = 0, length = this.cssRules.length; i < length; i++) {
			cssTexts.push(this.cssRules[i]?.cssText);
		}

		return '@supports ' + this.conditionText + ' {' + cssTexts.join('') + '}';
	}
}
