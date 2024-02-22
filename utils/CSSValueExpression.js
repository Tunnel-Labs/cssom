// @ts-check

import { CSSValue } from './CSSValue.js';

/**
 * @constructor
 * @see http://msdn.microsoft.com/en-us/library/ms537634(v=vs.85).aspx
 */
export class CSSValueExpression extends CSSValue {
	/**
	 * @param {any} token
	 * @param {any} idx
	 */
	constructor(token, idx) {
		super();
		this._token = token;
		this._idx = idx;
	}

	/**
	 * parse css expression() value
	 *
	 * @return {Object}
	 *         - error:
	 *         or
	 *         - idx:
	 *         - expression:
	 *
	 * Example:
	 *
	 * .selector {
	 * 		zoom: expression(documentElement.clientWidth > 1000 ? '1000px' : 'auto');
	 * }
	 */
	parse() {
		var token = this._token,
			idx = this._idx;

		var character = '',
			expression = '',
			error = '',
			info,
			paren = [];

		for (;; ++idx) {
			character = token.charAt(idx);

			// end of token
			if (character === '') {
				error = 'css expression error: unfinished expression!';
				break;
			}

			switch (character) {
				case '(':
					paren.push(character);
					expression += character;
					break;

				case ')':
					paren.pop();
					expression += character;
					break;

				case '/':
					if ((info = this._parseJSComment(token, idx))) { // comment?
						if (info.error) {
							error = 'css expression error: unfinished comment in expression!';
						} else {
							idx = info.idx;
							// ignore the comment
						}
					} else if ((info = this._parseJSRexExp(token, idx))) { // regexp
						idx = info.idx;
						expression += info.text;
					} else { // other
						expression += character;
					}
					break;

				case "'":
				case '"':
					info = this._parseJSString(token, idx, character);
					if (info) { // string
						idx = info.idx;
						expression += info.text;
					} else {
						expression += character;
					}
					break;

				default:
					expression += character;
					break;
			}

			if (error) {
				break;
			}

			// end of expression
			if (paren.length === 0) {
				break;
			}
		}

		var ret;
		if (error) {
			ret = {
				error: error,
			};
		} else {
			ret = {
				idx: idx,
				expression: expression,
			};
		}

		return ret;
	}

	/**
	 * @param {string} token
	 * @param {number} idx
	 * @return {any|false}
	 *          - idx:
	 *          - text:
	 *          or
	 *          - error:
	 *          or
	 *          false
	 */
	_parseJSComment(token, idx) {
		var nextChar = token.charAt(idx + 1),
			text;

		if (nextChar === '/' || nextChar === '*') {
			var startIdx = idx,
				endIdx,
				commentEndChar;

			if (nextChar === '/') { // line comment
				commentEndChar = '\n';
			} else if (nextChar === '*') { // block comment
				commentEndChar = '*/';
			}

			endIdx = token.indexOf(
				// @ts-ignore
				commentEndChar,
				startIdx + 1 + 1,
			);
			if (endIdx !== -1) {
				// @ts-ignore
				endIdx = endIdx + commentEndChar.length - 1;
				text = token.substring(idx, endIdx + 1);
				return {
					idx: endIdx,
					text: text,
				};
			} else {
				var error = 'css expression error: unfinished comment in expression!';
				return {
					error: error,
				};
			}
		} else {
			return false;
		}
	}

	/**
	 * @param {string} token
	 * @param {number} idx
	 * @param {string} sep
	 * @return {any|false}
	 * 					- idx:
	 * 					- text:
	 * 					or
	 * 					false
	 */
	_parseJSString(token, idx, sep) {
		var endIdx = this._findMatchedIdx(token, idx, sep),
			text;

		if (endIdx === -1) {
			return false;
		} else {
			text = token.substring(idx, endIdx + sep.length);

			return {
				idx: endIdx,
				text: text,
			};
		}
	}

	/**
	 * parse regexp in css expression
	 *
	 * @param {string} token
	 * @param {number} idx
	 * @return {any|false}
	 * 				- idx:
	 * 				- regExp:
	 * 				or
	 * 				false
	 */

	/*

all legal RegExp

/a/
(/a/)
[/a/]
[12, /a/]

!/a/

+/a/
-/a/
* /a/
/ /a/
%/a/

===/a/
!==/a/
==/a/
!=/a/
>/a/
>=/a/
</a/
<=/a/

&/a/
|/a/
^/a/
~/a/
<</a/
>>/a/
>>>/a/

&&/a/
||/a/
?/a/
=/a/
,/a/

		delete /a/
				in /a/
instanceof /a/
				new /a/
		typeof /a/
			void /a/

	*/
	_parseJSRexExp(token, idx) {
		var before = token.substring(0, idx).replace(/\s+$/, ''),
			legalRegx = [
				/^$/,
				/\($/,
				/\[$/,
				/\!$/,
				/\+$/,
				/\-$/,
				/\*$/,
				/\/\s+/,
				/\%$/,
				/\=$/,
				/\>$/,
				/<$/,
				/\&$/,
				/\|$/,
				/\^$/,
				/\~$/,
				/\?$/,
				/\,$/,
				/delete$/,
				/in$/,
				/instanceof$/,
				/new$/,
				/typeof$/,
				/void$/,
			];

		var isLegal = legalRegx.some(function(reg) {
			return reg.test(before);
		});

		if (!isLegal) {
			return false;
		} else {
			var sep = '/';

			// same logic as string
			return this._parseJSString(token, idx, sep);
		}
	}

	/**
	 * find next sep(same line) index in `token`
	 * @param {string} token
	 * @param {number} idx
	 * @param {string} sep
	 * @return {Number}
	 */
	_findMatchedIdx(token, idx, sep) {
		var startIdx = idx,
			endIdx;

		var NOT_FOUND = -1;

		while (true) {
			endIdx = token.indexOf(sep, startIdx + 1);

			if (endIdx === -1) { // not found
				endIdx = NOT_FOUND;
				break;
			} else {
				var text = token.substring(idx + 1, endIdx),
					matched = text.match(/\\+$/);
				// @ts-ignore
				if (!matched || matched[0] % 2 === 0) { // not escaped
					break;
				} else {
					startIdx = endIdx;
				}
			}
		}

		// boundary must be in the same line(js sting or regexp)
		var nextNewLineIdx = token.indexOf('\n', idx + 1);
		if (nextNewLineIdx < endIdx) {
			endIdx = NOT_FOUND;
		}

		return endIdx;
	}
}
