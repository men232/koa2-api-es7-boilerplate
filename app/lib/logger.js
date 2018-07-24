import path from 'path';
import fs from 'fs';

import config from 'config';
import prettyjson from 'prettyjson';
import { createLogger, format, transports } from 'winston';

import 'winston-daily-rotate-file';

if (!config.logger) {
	console.warn('WARNING: Please define the logger section in config.'); // eslint-disable-line
}

// Assign default logger config
const CONFIG = Object.assign({
	level: 'debug',
	dir: path.join(process.cwd(), 'logs'),
	splitFiles: []
}, config.logger || {});

export default Logger;

// Create logger dirrectory
if (!fs.existsSync(CONFIG.dir)) {
	fs.mkdirSync(CONFIG.dir);
}

const FORMAT_COLORIZE = format.colorize({ all: true });

// Simple console format with prettyjson for meta data
const CONSOLE_FORMAT = format.printf(info => {
	const level = info.level;

	info.level = FORMAT_COLORIZE.colorize(level);

	if (typeof info.message === 'object') {
		info.message = '->\n' + prettyjson.render(info.message);
	} else {
		info.message = FORMAT_COLORIZE.colorize(level, info.message);
	}

	if (info.meta) {
		info.message += '\n' + prettyjson.render(info.meta);
	}

	return `${info.level} [${info.label}]: ${info.message}`;
});

// Used for each logger instances
const SHARED_CONSOLE_TRANSPORT = new transports.Console({
	level: CONFIG.level,
	format: CONSOLE_FORMAT
});

SHARED_CONSOLE_TRANSPORT.setMaxListeners(0);

// Used for each logger instances
// this means: write all logs > app.log
const DEBUG_SHARED_FILE_TRANSPORT = fileTransport('debug', 'app');

// Used for each logger instances
// this means: write all logs > app.{level}.log
const SHARED_FILE_TRANSPORTS = CONFIG.splitFiles.map(level => {
	return fileTransport(level, `app.${level}`);
});

function Logger(module, label) {
	let fileTransports = SHARED_FILE_TRANSPORTS;

	// use separate file transports for labeled logger
	// filename: {label}.{level}.log
	if (label) {
		fileTransports = CONFIG.splitFiles.map(level => {
			return fileTransport(level, `${label}.${level}`);
		});

		fileTransports.push(fileTransport('debug', `${label}`));
	}

	// compute label by module filename
	// last two level of path
	if (!label) {
		label = module.filename
			.split(path.sep)
			.slice(-2)
			.join(path.sep);
	}

	return createLogger({
		format: format.combine(
			format.label({ label }),
			format.timestamp(),
			format.splat(),
		),
		transports: [
			SHARED_CONSOLE_TRANSPORT,
			DEBUG_SHARED_FILE_TRANSPORT,
			...fileTransports
		]
	});
}

function fileTransport(level, fileName) {
	const params = Object.assign({
		dirname: path.join(CONFIG.dir, '%DATE%'),
		filename: `${fileName}.log`,
		level: level,
		format: format.json()
	}, CONFIG.dailyRotate || {});

	const transport = new transports.DailyRotateFile(params);
	transport.setMaxListeners(0);

	return transport;
}
