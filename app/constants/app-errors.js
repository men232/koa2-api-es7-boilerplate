export const UNKNOWN_ENDPOINT = {
	code: 'UNKNOWN_ENDPOINT',
	status: 404,
	message: 'The requested endpoint does not exist.'
};

export const INVALID_REQUEST = {
	code: 'INVALID_REQUEST',
	status: 400,
	message: 'The request has invalid parameters.'
};

export const UNKNOWN_ERROR = {
	code: 'UNKNOWN_ERROR',
	status: 500,
	message: 'The server encountered an unknown internal error.'
};

export const TOKEN_EXPIRED_ERROR = {
	code: 'TOKEN_EXPIRED_ERROR',
	status: 401,
	message: 'Validating token error, session has expired.'
};

export const TOKEN_VALIDATION_ERROR = {
	code: 'TOKEN_VALIDATION_ERROR',
	status: 401,
	message: 'Token validation error.'
};
