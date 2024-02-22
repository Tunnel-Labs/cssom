// @ts-check

/**
 * @constructor
 * @see https://developer.mozilla.org/en/CSS/@-moz-document
 */
export class MatcherList {
	constructor() {
		this.length = 0;
	}

	/**
	 * @return {string}
	 */
	get matcherText() {
		return Array.prototype.join.call(this, ', ');
	}

	/**
	 * @param {string} value
	 */
	set matcherText(value) {
		// just a temporary solution, actually it may be wrong by just split the value with ',', because a url can include ','.
		var values = value.split(',');
		var length = this.length = values.length;
		for (var i = 0; i < length; i++) {
			// @ts-ignore
			this[i] = values[i].trim();
		}
	}

	/**
	 * @param {string} matcher
	 */
	appendMatcher(matcher) {
		if (Array.prototype.indexOf.call(this, matcher) === -1) {
			// @ts-ignore
			this[this.length] = matcher;
			this.length++;
		}
	}

	/**
	 * @param {string} matcher
	 */
	deleteMatcher(matcher) {
		var index = Array.prototype.indexOf.call(this, matcher);
		if (index !== -1) {
			Array.prototype.splice.call(this, index, 1);
		}
	}
}
