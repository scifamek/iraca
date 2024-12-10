import { readdirSync, readFileSync } from 'fs';
import { generateError } from '../helpers';
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

type ObjectInstance = any;

const ComponentIsNotConfiguredYet = generateError(
	'ComponentIsNotConfiguredYet',
	'the {id} component is not configured yet'
);
const ClassNotResolved = generateError('ClassNotResolved', 'the {c} is not resolved yet');
export class IracaContainer {
	readonly pendingParticles: Map<string, ParticleConfiguration[]>;
	configsTable: Map<string, ParticleDefinition>;
	instancesDependencyTable: Map<
		string,
		Array<{
			generatedBy: string;
			instance: ObjectInstance;
		}>
	>;

	constructor() {
		this.configsTable = new Map();
		this.instancesDependencyTable = new Map();
		this.pendingParticles = new Map();
	}

	public size(): number {
		const objetoPlano = Array.from(this.instancesDependencyTable.entries()).map(([key, value]) => ({
			key,
			value: value.map((item) => ({
				generatedBy: item.generatedBy,
				instance: item.instance,
			})),
		}));

		const objetoString = JSON.stringify(objetoPlano);
		return new Blob([objetoString]).size;
	}

	addAll(container: IracaContainer) {
		this.configsTable = {...container.configsTable};
	}

	public async addByPattern(dirname: string, pattern: RegExp) {
		const files = readdirSync(dirname);
		const foundFiles = files
			.filter((x) => !x.endsWith('.map') && !x.endsWith('.d.ts'))
			.filter((file) => !!file.match(pattern));

		for (const file of foundFiles) {
			const usecaseName = file.replace(/\.js$/, '');
			const declarationFileContent = readFileSync(`${dirname}/${usecaseName}.d.ts`, 'utf-8');
			const constructorPattern = /^.*constructor\((.*)\)/gm;


			const dependencies = [];
			if (declarationFileContent) {
				const result = constructorPattern.exec(declarationFileContent);
				if (result) {
					const constructorLine = result[1];
					const injectionPattern = /([\w]+)[\s]*:[\s]*([\w]+)/gi;
					let found = injectionPattern.exec(constructorLine);
					while (found) {
						dependencies.push(found[2]);
						found = injectionPattern.exec(constructorLine);
					}
				}
			}

			const res = await import(`${dirname}/${file}`);
			const a = res[usecaseName];
			this.add({
				component: a,
				dependencies,
			});
		}

		return foundFiles;
	}
	public add(
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

	private _add(config: ParticleConfiguration): boolean {
		const prevRegisteredParticule = this.configsTable.get(config.id);
		if (prevRegisteredParticule && prevRegisteredParticule.constructor !== null) {
			return true;
		}
		let typeClass =
			(config as GenericParticleConfiguration).component ||
			(config as AbstractParticleConfiguration).implementation;

		const myState = this.getStateByDependencies(config.dependencies || []);

		if (myState.status === 'resolved') {
			this.configsTable.set(config.id, {
				status: 'resolved',
				config,
			} as ClassParticleDefinition);

			this.resolveDependentParticles(config);
			return true;
		} else {
			this.addPending(config, myState.notFoundDependencies);
			// this.addPending;

			this.configsTable.set(config.id, {
				status: 'pending',
				config,
			} as ClassParticleDefinition);

			return false;
		}
	}

	public addValue(config: ParticleValueConfiguration) {
		this.configsTable.set(config.id, {
			value: config.value,
			status: 'resolved',
			config,
		} as ValueParticleDefinition);
		this.resolveDependentParticles(config);
	}

	private getStateByDependencies(dependencies: any[]) {
		const foundDependencies: {
			[dependencyName: string]: ParticleDefinition;
		} = {};
		const notFoundDependencies: Array<string> = [];

		let status: Status = 'resolved';
		for (const dependency of dependencies) {
			const id = typeof dependency === 'string' ? (dependency as string) : dependency.name;

			const configuration: ParticleDefinition | undefined = this.configsTable.get(id);
			if (configuration) {
				if (['no-resolved', 'pending'].includes(configuration.status)) {
					status = 'pending';
				}
				foundDependencies[id] = configuration;
			} else {
				notFoundDependencies.push(dependency);
				status = 'pending';
			}
		}
		return {foundDependencies, notFoundDependencies, status};
	}

	public getInstance<TT>(instanceClass: any, parentId?: string) {
		const start = performance.now();
		let startTime = process.hrtime.bigint();
		const id = typeof instanceClass == 'string' ? instanceClass : instanceClass.name;

		const savedConfiguration: ParticleDefinition | undefined = this.configsTable.get(id);

		if (savedConfiguration) {
			if (savedConfiguration.status == 'resolved') {
				if ((savedConfiguration.config as ParticleValueConfiguration).value) {
					/* PERFORMANCE */
					const end = performance.now();
					const preciseDiffNanoseconds = (end - start) * 1000;
					let endTime = process.hrtime.bigint();
					const endDiff = endTime - startTime;

					//console.log('\n >>>> ', id, preciseDiffNanoseconds,endDiff, '\n');
					/* PERFORMANCE */

					return (savedConfiguration as ValueParticleDefinition).value as TT;
				}

				const innerConfig = savedConfiguration.config as ParticleConfiguration;

				if (innerConfig.strategy == 'singleton') {
					const tentativeInstance = this.instancesDependencyTable.get(id);

					if (tentativeInstance && tentativeInstance.length) {
						/* PERFORMANCE */
						const end = performance.now();
						const preciseDiffNanoseconds = (end - start) * 1000;
						let endTime = process.hrtime.bigint();
						const endDiff = endTime - startTime;

						//console.log('\n >>>> ', id, preciseDiffNanoseconds,endDiff, '\n');
						/* PERFORMANCE */
						return tentativeInstance[0].instance as TT;
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
					this.instancesDependencyTable.set(id, [
						{
							generatedBy: parentId || id,
							instance,
						},
					]);
					/* PERFORMANCE */
					const end = performance.now();
					const preciseDiffNanoseconds = (end - start) * 1000;
					let endTime = process.hrtime.bigint();
					const endDiff = endTime - startTime;

					//console.log('\n >>>> ', id, preciseDiffNanoseconds,endDiff, '\n');
					/* PERFORMANCE */
					return instance as TT;
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

					const instance: any = Reflect.construct(typeClass, depnden);

					instance.__id__ = Symbol();
					if (!this.instancesDependencyTable.get(id)) {
						this.instancesDependencyTable.set(id, []);
					}
					const prev = this.instancesDependencyTable.get(id);
					prev?.push({
						generatedBy: parentId || id,
						instance,
					});
					/* PERFORMANCE */
					const end = performance.now();
					const preciseDiffNanoseconds = (end - start) * 1000;
					let endTime = process.hrtime.bigint();
					const endDiff = endTime - startTime;

					//console.log('\n >>>> ', id, preciseDiffNanoseconds,endDiff, '\n');
					/* PERFORMANCE */
					return instance as TT;
				}
			} else {
				throw new ClassNotResolved({id});
			}
		}
		throw new ComponentIsNotConfiguredYet({id});
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
