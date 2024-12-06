import { DomainEvent, Iraca } from './config/system';
import { IracaContainer } from './dependency-injection/container';

export class B {
	constructor(_a: A) {}
}
export class A {
	data: any = '#';
	public save(data: any) {
		this.data = data;
	}
	hi() {
		return '.A.' + this.data;
	}
}
export class C {
	data: any = '#';
	constructor(_b: B) {}
	save(data: any) {
		this.data = data;
	}
	hi() {
		return '.C.' + this.data;
	}
}
export class D {
	constructor(private a: A, private c: C) {}
	hi() {
		console.log(this.a.hi() + ' - ' + this.c.hi());
	}
}

const container = new IracaContainer();

// container.add({
// 	component: B,
// 	dependencies: ['A'],
// });

// container.add({
// 	component: C,
// 	dependencies: ['B'],
// });
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
console.log(a);

a.save('%');

d.hi();
const aa = container.getInstance<A>('A')!;
const cc = container.getInstance<C>('C')!;
cc.save('|');
d.hi();
aa.save('&');
d.hi();

console.log(container.instancesTable);


const iraca = new Iraca(container);

iraca.notify(new DomainEvent('EVENT1', 789));
iraca.notify(new DomainEvent('EVENT2', 'Deivis'));

iraca.on('EVENT3', (payload) => {
	console.log('Respondió el usecase ', payload);
});
