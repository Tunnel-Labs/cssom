// @ts-check

import { CSSConditionRule } from './CSSConditionRule.js';
import { MediaList } from './MediaList.js';

// https://opensource.apple.com/source/WebCore/WebCore-7611.1.21.161.3/css/CSSMediaRule.cpp
/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#cssmediarule
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSMediaRule
 */
export class CSSMediaRule extends CSSConditionRule {
	type = 4;
	media = new MediaList();

	// @ts-ignore
	get conditionText() {
		return this.media.mediaText;
	}

	set conditionText(value) {
		this.media.mediaText = value;
	}

	// @ts-ignore
	get cssText() {
		var cssTexts = [];
		for (var i = 0, length = this.cssRules.length; i < length; i++) {
			cssTexts.push(this.cssRules[i]?.cssText);
		}
		return '@media ' + this.media.mediaText + ' {' + cssTexts.join('') + '}';
	}
}
