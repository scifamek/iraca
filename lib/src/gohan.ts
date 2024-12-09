const memoryUsageBefore = process.memoryUsage();

import { IracaContainer } from './dependency-injection/container';

function printMemory(title: string) {
	console.log(` - ${title} - `);

	const mem = process.memoryUsage();
	const rss = `${mem.rss / 1024 / 1024}MB`;
	console.log({rss});
	console.log('');
}
printMemory('Before');

export class B {
	constructor(_a: A) {}
}
export class A {
	prefix: string = '#';
	public setPrefix(prefix: string) {
		this.prefix = prefix;
	}
	hi() {
		return this.prefix + '.A.';
	}
}
export class C {
	prefix: string = '#';
	public setPrefix(prefix: string) {
		this.prefix = prefix;
	}
	hi() {
		return this.prefix + '.C.';
	}
}
export class D {
	prefix: string = '**';

	constructor(private a: A, private c: C) {}

	public setPrefix(prefix: string) {
		this.prefix = prefix;
	}
	hi() {
		console.log(this.prefix + '(' + this.a.hi() + ') - (' + this.c.hi() + ')');
	}
}

const container = new IracaContainer();

container.add({
	component: A,
	strategy: 'factory',
});
container.add({
	component: C,
	strategy: 'factory',
});

container.add({
	component: D,
	strategy: 'factory',
	dependencies: ['A', 'C'],
});

const FIREBASE_INIT = {l: 213};

container.addValue({
	id: 'FIREBASE_INIT',
	value: FIREBASE_INIT,
});

const d = container.getInstance<D>('D');
const a = container.getInstance<A>('A');
d.hi();

d.setPrefix('--');
// const l = 1000000;
// for (let index = 0; index < l; index++) {
// 	container.getInstance<D>('D');
// }
// // console.log(container.instancesDependencyTable);

// printMemory('After');
// container.instancesDependencyTable.clear();
// if (global.gc) {
// 	// global.gc();
// }
// setTimeout(() => {
	
// 	printMemory('After 3');
// }, 2000);
// printMemory('After 2');

// a.setPrefix('%');

// d.hi();
// const aa = container.getInstance<A>('A')!;
// const cc = container.getInstance<C>('C')!;
// cc.setPrefix('|');
// d.hi();
// aa.setPrefix('&');
// d.hi();

// console.log(container.instancesDependencyTable);

// const iraca = new Iraca(container);

// iraca.notify(new DomainEvent('EVENT1', 789));
// iraca.notify(new DomainEvent('EVENT2', 'Deivis'));

// iraca.on('EVENT3', (payload) => {
// 	console.log('Respondió el usecase ', payload);
// });
