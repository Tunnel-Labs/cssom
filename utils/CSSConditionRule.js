// @ts-check

import { CSSGroupingRule } from './CSSGroupingRule.js';

/**
 * @constructor
 * @see https://www.w3.org/TR/css-conditional-3/#the-cssconditionrule-interface
 */
export class CSSConditionRule extends CSSGroupingRule {
	conditionText = '';
	cssText = '';
}
