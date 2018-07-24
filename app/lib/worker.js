import EventEmitter from 'events';
import path from 'path';
import logger from './logger';

const WORKER_DISABLED = (process.env.WORKER_DISABLED || '')
	.split(',')
	.map(v => v.trim());

/**
 * Simple wrap class for worker scripts
 */
class Worker extends EventEmitter {
	/**
	 * Worker constructor
	 * @param  {Object}   module                 Node module object
	 * @param  {Function} options.doWork         Worker name
	 * @param  {Function} options.doWork         Worker function
	 * @param  {Number}   options.doInterval     With what interval should run the worker function
	 * @param  {Boolean}  options.runImmediately Run worker function immediately flag
	 * @param  {Boolean}  options.preventPepeat  Prevent run the worker if the past is not completed
	 * @return {Worker}
	 */
	constructor(module, { name, doWork, doInterval, runImmediately, preventPepeat = true }) {
		super();

		this.inProgress = false;
		this.preventPepeat = preventPepeat;
		this.doWork = doWork;
		this.doInterval = doInterval;
		this.log = logger(module, name);
		this.name = name || 'dark horse';
		this.filename = path.basename(module.filename, '.js');
		this.isDisabled = Worker.isDisabled(this.filename);

		this.on('error', this.onError.bind(this));

		if (this.isDisabled) {
			this.log.warn('disabled from env variable.');
			return;
		}

		if (runImmediately) {
			setTimeout(() => this.run(), 0);
		}

		this.initInterval();
		this.log.info({ event: 'initialized' });
	}

	initInterval() {
		if (!this.doInterval) return;

		this.destroyInterval();
		this.intervalTimer = setInterval(this.run.bind(this), this.doInterval);
		this.log.debug({ event: 'init_interval', ms: this.doInterval });
	}

	destroyInterval() {
		if (!this.intervalTimer) return;

		clearInterval(this.intervalTimer);
		this.intervalTimer = undefined;
		this.log.debug({ event: 'destroy_interval'});
	}

	run(...args) {
		if (this.preventPepeat && this.inProgress) {
			this.log.debug({ event: 'cooldown', reason: 'still in process'});
			return;
		}

		this.inProgress = true;
		this.destroyInterval();

		this.log.debug({ event: 'run', args});
		this.emit('worker:run');

		this.doWork(...args).then((result) => {
			this.inProgress = false;
			this.emit('worker:complete', result);
			this.log.info({ event: 'complete', result });
		}).catch(err => {
			this.inProgress = false;
			this.emit('worker:error', err);
			this.onError(err);
		}).then(() => {
			this.initInterval();
		});
	}

	destroy() {
		this.destroyInterval();
	}

	onError(err) {
		this.log.info({ err, event: 'error' });
	}

	static isDisabled(basename) {
		if (basename.filename) {
			basename = path.basename(basename.filename);
		}

		return WORKER_DISABLED.indexOf(basename) > -1;
	}
}

export default Worker;
