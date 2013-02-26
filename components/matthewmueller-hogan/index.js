/**
 * Module dependencies
 */

var Hogan = require('./hogan');

/**
 * Expose `render()`.`
 */

exports = module.exports = render;

/**
 * Expose `compile()`.
 */

exports.compile = compile;

/**
 * Render the given mustache `str` with `obj`.
 *
 * @param {String} str
 * @param {Object} obj
 * @return {String}
 * @api public
 */

function render(str, obj) {
  var fn = compile(str);
  return fn(obj || {});
}

/**
 * Compile the given `str` to a `Function`.
 *
 * @param {String} str
 * @param {Object} opts
 * @return {Function}
 * @api public
 */

function compile(str, opts) {
  var tpl = Hogan.compile(str, opts);
  return bind(tpl.render, tpl);
}

/**
 * bind the function to a particular context
 * @param  {Function} fn
 * @param  {object}   context
 */

function bind(fn, context) {
  return function() { return fn.apply(context, arguments); };
}
