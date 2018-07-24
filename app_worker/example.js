// npm run job example

import Worker from 'lib/worker';

const WORKER_NAME = 'worker-example';
const DO_INTERVAL = 1 * 60 * 1000; // Each 1 min

const worker = new Worker(module, {
	doWork,
	name: WORKER_NAME,
	doInterval: DO_INTERVAL,
	runImmediately: true
});

export default worker;

const log = worker.log;

async function doWork() {
	// Do some stuff here

	log.debug('compute random number.');
	return { result: Math.random() };
}
