const originalConsole = {...console};

beforeAll(() => {
	console.debug = (...args: any[]) => {
		process.stdout.write(`DEBUG: ${args.map((x) => JSON.stringify(x, null, 2)).join('\n')}\n`);
	};

	// console.log = (...args: any[]) => {
	// 	// process.stdout.write(`${args.map((x) => JSON.stringify(x, null, 2)).join('\n')}\n`);
	// 	process.stdout.write(args);

	// };

	console.error = (...args: any[]) => {
		process.stderr.write(`ERROR: ${args.join(' ')}\n`);
	};

	console.warn = (...args: any[]) => {
		process.stderr.write(`WARN: ${args.join(' ')}\n`);
	};
});

afterAll(() => {
	console.debug = originalConsole.debug;
	console.log = originalConsole.log;
	console.error = originalConsole.error;
	console.warn = originalConsole.warn;
});
