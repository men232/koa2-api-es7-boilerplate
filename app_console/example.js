// npm run console example

const log = console;
const step = parseInt(process.argv[3]) || 10;

run(step)
	.then(log.info)
	.catch(log.error)
	.then(fin);

async function run(n = 10) {
	const fibonacci = [0, 1];

	for (let i = 2; i < n; i++) {
		fibonacci[i] = fibonacci[i - 1] + fibonacci[i - 2];
	}

	return fibonacci;
}

function fin(code = 0) {
	// can make some async staff
	// like disconnect from db
	process.exit(code);
}
