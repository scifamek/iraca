export type Status = 'resolved' | 'pending' | 'no-resolved';
export type Particle = any;
export interface BaseParticleConfiguration {
	id: string;
	dependencies?: any[];
	strategy?: 'singleton' | 'factory';
}

export interface GenericParticleConfiguration extends BaseParticleConfiguration {
	component: any;
}
export interface AbstractParticleConfiguration extends BaseParticleConfiguration {
	abstraction: any;
	implementation: any;
}
export type ParticleConfiguration = GenericParticleConfiguration | AbstractParticleConfiguration;

export interface ParticleValueConfiguration {
	id: string;
	value: any;
}

export interface ClassParticleDefinition {
	status: Status;
	config: ParticleConfiguration;
	strategy: 'singleton' | 'factory';
}
export interface ValueParticleDefinition {
	value: any;
	status: Status;
	config: ParticleValueConfiguration;
}
export type ParticleDefinition = ClassParticleDefinition | ValueParticleDefinition;
// export interface SingletonParticleDefinition<T = any> extends BaseParticleDefinition {
// }
// export interface FactoryParticleDefinition<T = any> extends BaseParticleDefinition {
// }

// export type ParticleDefinition<T = any> = FactoryParticleDefinition<T> | SingletonParticleDefinition<T>;
