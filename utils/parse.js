// @ts-check

import { CSSDocumentRule } from './CSSDocumentRule.js';
import { CSSFontFaceRule } from './CSSFontFaceRule.js';
import { CSSHostRule } from './CSSHostRule.js';
import { CSSImportRule } from './CSSImportRule.js';
import { CSSKeyframeRule } from './CSSKeyframeRule.js';
import { CSSKeyframesRule } from './CSSKeyframesRule.js';
import { CSSMediaRule } from './CSSMediaRule.js';
import { CSSStyleRule } from './CSSStyleRule.js';
import { CSSStyleSheet } from './CSSStyleSheet.js';
import { CSSSupportsRule } from './CSSSupportsRule.js';
import { CSSValueExpression } from './CSSValueExpression.js';

/**
 * @param {string} token
 */
export function parse(token) {
	var i = 0;

	/**
		"before-selector" or
		"selector" or
		"atRule" or
		"atBlock" or
		"conditionBlock" or
		"before-name" or
		"name" or
		"before-value" or
		"value"
	*/
	var state = 'before-selector';

	var index;
	var buffer = '';
	var valueParenthesisDepth = 0;

	var SIGNIFICANT_WHITESPACE = {
		'selector': true,
		'value': true,
		'value-parenthesis': true,
		'atRule': true,
		'importRule-begin': true,
		'importRule': true,
		'atBlock': true,
		'conditionBlock': true,
		'documentRule-begin': true,
	};

	var styleSheet = new CSSStyleSheet();

	// @type CSSStyleSheet|CSSMediaRule|CSSSupportsRule|CSSFontFaceRule|CSSKeyframesRule|CSSDocumentRule
	var currentScope = styleSheet;

	// @type CSSMediaRule|CSSSupportsRule|CSSKeyframesRule|CSSDocumentRule
	var parentRule;

	/** @type {any[]} */
	var ancestorRules = [];
	var hasAncestors = false;
	var prevScope;

	var name,
		priority = '',
		styleRule,
		mediaRule,
		supportsRule,
		importRule,
		fontFaceRule,
		keyframesRule,
		documentRule,
		hostRule;

	var atKeyframesRegExp = /@(-(?:\w+-)+)?keyframes/g;

	/** @param {string} message */
	var parseError = function(message) {
		var lines = token.substring(0, i).split('\n');
		var lineCount = lines.length;
		// @ts-ignore
		var charCount = lines.pop().length + 1;
		var error = new Error(
			message + ' (line ' + lineCount + ', char ' + charCount + ')',
		);
		// @ts-ignore
		error.line = lineCount;
		/* jshint sub : true */
		// @ts-ignore
		error['char'] = charCount;
		// @ts-ignore
		error.styleSheet = styleSheet;
		throw error;
	};

	for (var character; (character = token.charAt(i)); i++) {
		switch (character) {
			case ' ':
			case '\t':
			case '\r':
			case '\n':
			case '\f':
				// @ts-ignore
				if (SIGNIFICANT_WHITESPACE[state]) {
					buffer += character;
				}
				break;

			// String
			case '"':
				index = i + 1;
				do {
					index = token.indexOf('"', index) + 1;
					if (!index) {
						parseError('Unmatched "');
					}
				} while (token[index - 2] === '\\');
				buffer += token.slice(i, index);
				i = index - 1;
				switch (state) {
					case 'before-value':
						state = 'value';
						break;
					case 'importRule-begin':
						state = 'importRule';
						break;
				}
				break;

			case "'":
				index = i + 1;
				do {
					index = token.indexOf("'", index) + 1;
					if (!index) {
						parseError("Unmatched '");
					}
				} while (token[index - 2] === '\\');
				buffer += token.slice(i, index);
				i = index - 1;
				switch (state) {
					case 'before-value':
						state = 'value';
						break;
					case 'importRule-begin':
						state = 'importRule';
						break;
				}
				break;

			// Comment
			case '/':
				if (token.charAt(i + 1) === '*') {
					i += 2;
					index = token.indexOf('*/', i);
					if (index === -1) {
						parseError('Missing */');
					} else {
						i = index + 1;
					}
				} else {
					buffer += character;
				}
				if (state === 'importRule-begin') {
					buffer += ' ';
					state = 'importRule';
				}
				break;

			// At-rule
			case '@':
				if (token.indexOf('@-moz-document', i) === i) {
					state = 'documentRule-begin';
					documentRule = new CSSDocumentRule();
					// @ts-ignore
					documentRule.__starts = i;
					i += '-moz-document'.length;
					buffer = '';
					break;
				} else if (token.indexOf('@media', i) === i) {
					state = 'atBlock';
					mediaRule = new CSSMediaRule();
					// @ts-ignore
					mediaRule.__starts = i;
					i += 'media'.length;
					buffer = '';
					break;
				} else if (token.indexOf('@supports', i) === i) {
					state = 'conditionBlock';
					supportsRule = new CSSSupportsRule();
					// @ts-ignore
					supportsRule.__starts = i;
					i += 'supports'.length;
					buffer = '';
					break;
				} else if (token.indexOf('@host', i) === i) {
					state = 'hostRule-begin';
					i += 'host'.length;
					hostRule = new CSSHostRule();
					// @ts-ignore
					hostRule.__starts = i;
					buffer = '';
					break;
				} else if (token.indexOf('@import', i) === i) {
					state = 'importRule-begin';
					i += 'import'.length;
					buffer += '@import';
					break;
				} else if (token.indexOf('@font-face', i) === i) {
					state = 'fontFaceRule-begin';
					i += 'font-face'.length;
					fontFaceRule = new CSSFontFaceRule();
					// @ts-ignore
					fontFaceRule.__starts = i;
					buffer = '';
					break;
				} else {
					atKeyframesRegExp.lastIndex = i;
					var matchKeyframes = atKeyframesRegExp.exec(token);
					if (matchKeyframes && matchKeyframes.index === i) {
						state = 'keyframesRule-begin';
						keyframesRule = new CSSKeyframesRule();
						// @ts-ignore
						keyframesRule.__starts = i;
						keyframesRule._vendorPrefix = matchKeyframes[1]; // Will come out as undefined if no prefix was found
						i += matchKeyframes[0].length - 1;
						buffer = '';
						break;
					} else if (state === 'selector') {
						state = 'atRule';
					}
				}
				buffer += character;
				break;

			case '{':
				if (state === 'selector' || state === 'atRule') {
					// @ts-ignore
					styleRule.selectorText = buffer.trim();
					// @ts-ignore
					styleRule.style.__starts = i;
					buffer = '';
					state = 'before-name';
				} else if (state === 'atBlock') {
					// @ts-ignore
					mediaRule.media.mediaText = buffer.trim();

					if (parentRule) {
						ancestorRules.push(parentRule);
					}

					// @ts-ignore
					currentScope = parentRule = mediaRule;
					// @ts-ignore
					mediaRule.parentStyleSheet = styleSheet;
					buffer = '';
					state = 'before-selector';
				} else if (state === 'conditionBlock') {
					// @ts-ignore
					supportsRule.conditionText = buffer.trim();

					if (parentRule) {
						ancestorRules.push(parentRule);
					}

					// @ts-ignore
					currentScope = parentRule = supportsRule;
					// @ts-ignore
					supportsRule.parentStyleSheet = styleSheet;
					buffer = '';
					state = 'before-selector';
				} else if (state === 'hostRule-begin') {
					if (parentRule) {
						ancestorRules.push(parentRule);
					}

					// @ts-ignore
					currentScope = parentRule = hostRule;
					// @ts-ignore
					hostRule.parentStyleSheet = styleSheet;
					buffer = '';
					state = 'before-selector';
				} else if (state === 'fontFaceRule-begin') {
					if (parentRule) {
						// @ts-ignore
						fontFaceRule.parentRule = parentRule;
					}
					// @ts-ignore
					fontFaceRule.parentStyleSheet = styleSheet;
					styleRule = fontFaceRule;
					buffer = '';
					state = 'before-name';
				} else if (state === 'keyframesRule-begin') {
					// @ts-ignore
					keyframesRule.name = buffer.trim();
					if (parentRule) {
						ancestorRules.push(parentRule);
						// @ts-ignore
						keyframesRule.parentRule = parentRule;
					}
					// @ts-ignore
					keyframesRule.parentStyleSheet = styleSheet;
					// @ts-ignore
					currentScope = parentRule = keyframesRule;
					buffer = '';
					state = 'keyframeRule-begin';
				} else if (state === 'keyframeRule-begin') {
					styleRule = new CSSKeyframeRule();
					styleRule.keyText = buffer.trim();
					// @ts-ignore
					styleRule.__starts = i;
					buffer = '';
					state = 'before-name';
				} else if (state === 'documentRule-begin') {
					// FIXME: what if this '{' is in the url text of the match function?
					// @ts-ignore
					documentRule.matcher.matcherText = buffer.trim();
					if (parentRule) {
						ancestorRules.push(parentRule);
						// @ts-ignore
						documentRule.parentRule = parentRule;
					}
					// @ts-ignore
					currentScope = parentRule = documentRule;
					// @ts-ignore
					documentRule.parentStyleSheet = styleSheet;
					buffer = '';
					state = 'before-selector';
				}
				break;

			case ':':
				if (state === 'name') {
					name = buffer.trim();
					buffer = '';
					state = 'before-value';
				} else {
					buffer += character;
				}
				break;

			case '(':
				if (state === 'value') {
					// ie css expression mode
					if (buffer.trim() === 'expression') {
						var info = (new CSSValueExpression(token, i)).parse();

						// @ts-ignore
						if (info.error) {
							// @ts-ignore
							parseError(info.error);
						} else {
							// @ts-ignore
							buffer += info.expression;
							// @ts-ignore
							i = info.idx;
						}
					} else {
						state = 'value-parenthesis';
						// always ensure this is reset to 1 on transition
						// from value to value-parenthesis
						valueParenthesisDepth = 1;
						buffer += character;
					}
				} else if (state === 'value-parenthesis') {
					valueParenthesisDepth++;
					buffer += character;
				} else {
					buffer += character;
				}
				break;

			case ')':
				if (state === 'value-parenthesis') {
					valueParenthesisDepth--;
					if (valueParenthesisDepth === 0) state = 'value';
				}
				buffer += character;
				break;

			case '!':
				if (state === 'value' && token.indexOf('!important', i) === i) {
					priority = 'important';
					i += 'important'.length;
				} else {
					buffer += character;
				}
				break;

			case ';':
				switch (state) {
					case 'value':
						// @ts-ignore
						styleRule.style.setProperty(name, buffer.trim(), priority);
						priority = '';
						buffer = '';
						state = 'before-name';
						break;
					case 'atRule':
						buffer = '';
						state = 'before-selector';
						break;
					case 'importRule':
						importRule = new CSSImportRule();
						// @ts-ignore
						importRule.parentStyleSheet =
							importRule.styleSheet
								.parentStyleSheet =
								styleSheet;
						importRule.cssText = buffer + character;
						// @ts-ignore
						styleSheet.cssRules.push(importRule);
						buffer = '';
						state = 'before-selector';
						break;
					default:
						buffer += character;
						break;
				}
				break;

			case '}':
				switch (state) {
					case 'value':
						// @ts-ignore
						styleRule.style.setProperty(name, buffer.trim(), priority);
						priority = '';
						/* falls through */
					case 'before-name':
					case 'name':
						// @ts-ignore
						styleRule.__ends = i + 1;
						if (parentRule) {
							// @ts-ignore
							styleRule.parentRule = parentRule;
						}
						// @ts-ignore
						styleRule.parentStyleSheet = styleSheet;
						// @ts-ignore
						currentScope.cssRules.push(styleRule);
						buffer = '';
						if (currentScope.constructor === CSSKeyframesRule) {
							state = 'keyframeRule-begin';
						} else {
							state = 'before-selector';
						}
						break;
					case 'keyframeRule-begin':
					case 'before-selector':
					case 'selector':
						// End of media/supports/document rule.
						if (!parentRule) {
							parseError('Unexpected }');
						}

						// Handle rules nested in @media or @supports
						hasAncestors = ancestorRules.length > 0;

						while (ancestorRules.length > 0) {
							parentRule = ancestorRules.pop();

							if (
								parentRule.constructor.name === 'CSSMediaRule' ||
								parentRule.constructor.name === 'CSSSupportsRule'
							) {
								prevScope = currentScope;
								currentScope = parentRule;
								// @ts-ignore
								currentScope.cssRules.push(prevScope);
								break;
							}

							if (ancestorRules.length === 0) {
								hasAncestors = false;
							}
						}

						if (!hasAncestors) {
							// @ts-ignore
							currentScope.__ends = i + 1;
							// @ts-ignore
							styleSheet.cssRules.push(currentScope);
							currentScope = styleSheet;
							parentRule = null;
						}

						buffer = '';
						state = 'before-selector';
						break;
				}
				break;

			default:
				switch (state) {
					case 'before-selector':
						state = 'selector';
						styleRule = new CSSStyleRule();
						// @ts-ignore
						styleRule.__starts = i;
						break;
					case 'before-name':
						state = 'name';
						break;
					case 'before-value':
						state = 'value';
						break;
					case 'importRule-begin':
						state = 'importRule';
						break;
				}
				buffer += character;
				break;
		}
	}

	return styleSheet;
}
