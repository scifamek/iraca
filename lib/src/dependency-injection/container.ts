import {
	AbstractParticleConfiguration,
	ClassParticleDefinition,
	GenericParticleConfiguration,
	ParticleConfiguration,
	ParticleDefinition,
	ParticleValueConfiguration,
	Status,
	ValueParticleDefinition,
} from './models';

export class IracaContainer {
	readonly pendingParticles: Map<string, ParticleConfiguration[]>;
	configsTable: Map<string, ParticleDefinition>;
	instancesTable: Map<
		string,
		Array<{
			generatedBy: string;
			instance: any;
		}>
	>;

	constructor() {
		this.configsTable = new Map();
		this.instancesTable = new Map();
		this.pendingParticles = new Map();
	}
	addAll(container: IracaContainer) {
		this.configsTable = {...container.configsTable};
	}

	add(
		config: Omit<GenericParticleConfiguration, 'id'> | Omit<AbstractParticleConfiguration, 'id'>
	): boolean {
		const c = Object.assign(config);
		if (!c.id) {
			const component =
				(c as GenericParticleConfiguration).component ||
				(c as AbstractParticleConfiguration).abstraction;
			if (c) c.id = component.name;
		}
		if (!c.strategy) {
			c.strategy = 'singleton';
		}
		const res = this._add(c);
		return res;
	}

	makeInstance(
		typeClass: any,
		config: ParticleConfiguration,
		state: {
			foundDependencies: {
				[dependencyName: string]: ParticleDefinition;
			};
			notFoundDependencies: string[];
			status: Status;
		}
	) {
		console.log(typeClass, config, state);

		// const singletons = Object.values(state.dependencies)
		// 	.filter((x) => x.strategy === 'singleton')
		// 	.map((snapshot) => snapshot.instance);
		// const factories = Object.values(state.dependencies)
		// 	.filter((x) => x.strategy === 'factory')
		// 	.map((snapshot) => snapshot.instances);
		// const constructor = () => Reflect.construct(typeClass, singletons);
		// this.configsTable.set(config.id, {
		// 	constructor,
		// 	config,
		// 	status: 'resolved',
		// });
	}
	_add(config: ParticleConfiguration): boolean {
		const prevRegisteredParticule = this.configsTable.get(config.id);
		if (prevRegisteredParticule && prevRegisteredParticule.constructor !== null) {
			return true;
		}
		let typeClass =
			(config as GenericParticleConfiguration).component ||
			(config as AbstractParticleConfiguration).implementation;

		const myState = this.getStateByDependencies(config.dependencies || []);
		console.log(111, typeClass, myState);

		if (myState.status === 'resolved') {
			this.configsTable.set(config.id, {
				status: 'resolved',
				config,
			} as ClassParticleDefinition);
			this.makeInstance;
			// if (config.strategy == 'singleton') {
			// 	this.makeInstance(typeClass, config, myState);
			// }

			this.resolveDependentParticles(config);
			return true;
		} else {
			// this.addPending(config, myState.notFoundDependencies);
			this.addPending;

			this.configsTable.set(config.id, {
				status: 'pending',
				config,
			} as ClassParticleDefinition);

			return false;
		}
	}

	addValue(config: ParticleValueConfiguration) {
		this.configsTable.set(config.id, {
			value: config.value,
			status: 'resolved',
		} as ValueParticleDefinition);
		this.resolveDependentParticles(config);
	}

	private getStateByDependencies(dependenciesId: string[]) {
		const foundDependencies: {
			[dependencyName: string]: ParticleDefinition;
		} = {};
		const notFoundDependencies: Array<string> = [];

		let status: Status = 'resolved';
		for (const dependencyId of dependenciesId) {
			const configuration: ParticleDefinition | undefined = this.configsTable.get(dependencyId);
			if (configuration) {
				if (['no-resolved', 'pending'].includes(configuration.status)) {
					status = 'pending';
				}
				foundDependencies[dependencyId] = configuration;
			} else {
				notFoundDependencies.push(dependencyId);
				status = 'pending';
			}
		}
		return {foundDependencies, notFoundDependencies, status};
	}

	flush(id: Symbol){
		
	}
	getInstance<T>(id: string, parentId?: string): T {
		console.log('Obteniendo ', id, parentId);

		const savedConfiguration: ParticleDefinition | undefined = this.configsTable.get(id);
		if (savedConfiguration) {
			if (savedConfiguration.status == 'resolved') {
				if ((savedConfiguration.config as ParticleValueConfiguration).value) {
					return (savedConfiguration as ValueParticleDefinition).value as T;
				}

				const innerConfig = savedConfiguration.config as ParticleConfiguration;
				console.log(innerConfig.strategy,45444);
				
				if (innerConfig.strategy == 'singleton') {
					const tentativeInstance = this.instancesTable.get(id);

					if (tentativeInstance && tentativeInstance.length) {
						return tentativeInstance[0].instance as T;
					}
					let typeClass =
						(savedConfiguration.config as GenericParticleConfiguration).component ||
						(savedConfiguration.config as AbstractParticleConfiguration).implementation;

					const depnden: any[] = [];
					const dependencies =
						(savedConfiguration.config as ParticleConfiguration).dependencies || [];
					for (const ins of dependencies) {
						const ii = this.getInstance(ins, id);
						depnden.push(ii);
					}
					const constructor = Reflect.construct(typeClass, depnden);
					const instance = constructor;
					this.instancesTable.set(id, [
						{
							generatedBy: parentId || id,
							instance,
						},
					]);
					return instance as T;
				} else {
					const dependencies =
						(savedConfiguration.config as ParticleConfiguration).dependencies || [];
					const depnden: any[] = [];
					for (const ins of dependencies) {
						const ii = this.getInstance(ins, id);
						depnden.push(ii);
					}
					let typeClass =
						(savedConfiguration.config as GenericParticleConfiguration).component ||
						(savedConfiguration.config as AbstractParticleConfiguration).implementation;

					console.log(' / ', depnden);

					const constructor = Reflect.construct(typeClass, depnden);
					const instance = constructor;

					if (!this.instancesTable.get(id)) {
						this.instancesTable.set(id, []);
					}
					const prev = this.instancesTable.get(id);
					prev?.push({
						generatedBy: parentId || id,
						instance,
					});
					return instance as T;
				}
			} else {
				throw new Error('Class not resolved');
			}
		}
		throw new Error(`${id} component is not configuret yet`);
	}

	private resolveDependentParticles(config: ParticleConfiguration | ParticleValueConfiguration) {
		const dependents = this.pendingParticles.get(config.id);

		const newDependents = [];
		if (dependents) {
			for (let i = 0; i < dependents.length; i++) {
				const dependentConfig = dependents[i];
				const res = this._add(dependentConfig);
				if (!res) {
					newDependents.push(dependentConfig);
				}
			}
			dependents.splice(0, dependents.length, ...newDependents);
		}
		if (!!dependents && dependents.length == 0) {
			this.pendingParticles.delete(config.id);
		}
	}

	private addPending(
		config: ParticleConfiguration,
		dependencies: {[dependencyName: string]: ParticleDefinition}
	) {
		for (const dependencyName in dependencies) {
			const dependencyObj = dependencies[dependencyName];

			if (dependencyObj.status !== 'resolved') {
				if (!this.pendingParticles.get(dependencyName)) {
					this.pendingParticles.set(dependencyName, []);
				}
				const dep = this.pendingParticles.get(dependencyName);

				if (dep) {
					const exist = dep.filter((x) => x && x.id === config.id).length > 0;
					if (!exist) {
						dep.push(config);
					}
				}
			}
		}
	}
}
