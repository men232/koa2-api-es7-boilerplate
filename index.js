// common entry point for scripts
// you can adding some hook modules as newrelic here
// BOOT_PATH use for define the root sciprt path

const path = require('path');
const log = console;

const BOOT_PATH = process.env.BOOT_PATH || __dirname;
const SCRIPT_PATH = path.resolve(BOOT_PATH, process.argv[2]);

require('babel-register');
require('babel-polyfill');

try {
	require(SCRIPT_PATH);
} catch (err) {
	if (err.code === 'MODULE_NOT_FOUND') {
		log.error('Bootable error:\n' + err.message);
		process.exit(1);
	}

	throw err;
}
