import * as APP_ERRORS from 'constants/app-errors';

class AppError {
	/**
	 * AppError Constructor
	 * @param  {Number} code  Error code numbder
	 * @param  {String|Array} messages  Message of error
	 * @param  {Numver} statusCode
	 */
	constructor(code, messages, statusCode) {
		// Call base class contructor
		Error.apply(this, arguments);

		if (typeof Error.captureStackTrace !== 'function') {
			this.stack = (new Error()).stack;
		} else {
			Error.captureStackTrace(this, AppError);
		}

		const info = APP_ERRORS[code] || APP_ERRORS['UNKNOWN_ERROR'];

		if (!Array.isArray(messages)) {
			messages = [messages];
		}

		messages = messages.filter(v => !!v);

		if (!messages.length) {
			messages = [info.message];
		}

		this.name = 'AppError';
		this.code = info.code;
		this.statusCode = statusCode || info.status;
		this.messages = messages;
		this.message = messages[0];
	}

	/**
	 * Build simple object
	 * @return {Object} Contain code and message
	 */
	toJSON() {
		return {
			code: this.code,
			statusCode: this.statusCode,
			messages: this.messages
		};
	}

	toString() {
		return `AppError (${this.code}: ${this.statusCode}): ${this.message}`;
	}

	/**
	 * Check error code
	 * @param  {Number|String}  Number or name of error code
	 * @return {Boolean}        Compare result
	 */
	is(value) {
		if (this.code === value) {
			return true;
		} else if (typeof value === 'string' && APP_ERRORS[value]) {
			return this.code === APP_ERRORS[value].code;
		}

		return false;
	}
}

export default AppError;
