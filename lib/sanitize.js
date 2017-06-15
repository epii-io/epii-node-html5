'use strict'

const SAFE_CHARS = {
  '<': '\\u003C',
  '>': '\\u003E',
  '/': '\\u002F',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029'
}
const UNSAFE_CHARS_REGEXP = /[<>\/\u2028\u2029]/g

/**
 * replace unsafe HTML and invalid js char into unicode
 *
 * @see {@link https://github.com/yahoo/serialize-javascript}
 * @param  {String} text
 * @return {String}
 */
function sanitize(text) {
  return text.replace(UNSAFE_CHARS_REGEXP, char => SAFE_CHARS[char])
}

module.exports = sanitize
