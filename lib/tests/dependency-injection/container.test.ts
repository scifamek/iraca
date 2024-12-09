import { IracaContainer } from '@/dependency-injection/container';
import { A, C, D } from './container-helpers';

describe('IracaContainer in Singleton Mode', () => {
	let container: IracaContainer;

	beforeEach(() => {
		container = new IracaContainer();
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
			strategy: 'singleton',
			dependencies: ['A', 'C'],
		});
	});

	test('should return the same instance when the strategy is singleton', () => {
		const initSize = container.size();

		const d = container.getInstance<D>('D');

		let size = container.size();
		const d2 = container.getInstance<D>('D');

		expect(size).toBeGreaterThan(initSize);
		expect(d).toBe(d2);
	});
	test('should return the same size when the strategy is "singleton" and the request are many', () => {
		const d = container.getInstance<D>('D');
		const size = container.size();

		const d2 = container.getInstance<D>('D');
		const size2 = container.size();

		expect(size).toEqual(size2);
		expect(d).toBe(d2);
	});
});

describe('IracaContainer in Factory Mode', () => {
	let container: IracaContainer;

	beforeEach(() => {
		container = new IracaContainer();
		container.add({
			component: A,
			strategy: 'factory',
		});
	});



	test('should return a diferent instance when the strategy is "factory"', () => {
		const intents = 10;
		let prev = null;
		let initSize = container.size();
		console.debug('Initial ', initSize);
		let finalSize = 0;
		for (let i = 0; i < intents; i++) {
			let size = container.size();
			const current = container.getInstance<A>('A');
			let size2 = container.size();

			expect(size2).toBeGreaterThan(size);
			expect(prev).not.toBe(current);

			prev = current;
			finalSize = size2;
      console.log((current as any).__id__);
      
		}
		console.debug('Final ', finalSize);
    console.log(container.instancesDependencyTable);
    
	});
});
