// @ts-check

/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#the-medialist-interface
 */
export class MediaList {
	constructor() {
		this.length = 0;
	}

	/**
	 * @return {string}
	 */
	get mediaText() {
		return Array.prototype.join.call(this, ', ');
	}

	/**
	 * @param {string} value
	 */
	set mediaText(value) {
		var values = value.split(',');
		var length = this.length = values.length;
		for (var i = 0; i < length; i++) {
			// @ts-ignore
			this[i] = values[i].trim();
		}
	}

	/**
	 * @param {string} medium
	 */
	appendMedium(medium) {
		if (Array.prototype.indexOf.call(this, medium) === -1) {
			// @ts-ignore
			this[this.length] = medium;
			this.length++;
		}
	}

	/**
	 * @param {string} medium
	 */
	deleteMedium(medium) {
		var index = Array.prototype.indexOf.call(this, medium);
		if (index !== -1) {
			Array.prototype.splice.call(this, index, 1);
		}
	}
}
