'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defer = require('p-defer');

var CancelError = function (_Error) {
	_inherits(CancelError, _Error);

	function CancelError(message) {
		_classCallCheck(this, CancelError);

		var _this = _possibleConstructorReturn(this, (CancelError.__proto__ || Object.getPrototypeOf(CancelError)).call(this, message));

		_this.name = 'CancelError';
		return _this;
	}

	return CancelError;
}(Error);

var generate = function generate(willResolve) {
	return function (ms, value) {
		ms = ms || 0;
		var useValue = arguments.length > 1;
		var result = value;

		var delaying = defer();
		var promise = delaying.promise;

		var timeout = setTimeout(function () {
			var settle = willResolve ? delaying.resolve : delaying.reject;
			settle(result);
		}, ms);

		var thunk = function thunk(thunkResult) {
			if (!useValue) {
				result = thunkResult;
			}
			return promise;
		};

		thunk.then = promise.then.bind(promise);
		thunk.catch = promise.catch.bind(promise);
		thunk._actualPromise = promise;

		thunk.cancel = function () {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
				delaying.reject(new CancelError('Delay canceled'));
			}
		};

		return thunk;
	};
};

module.exports = generate(true);
module.exports.reject = generate(false);
module.exports.CancelError = CancelError;
