import { AbstractParticleConfiguration, GenericParticleConfiguration, ParticleConfiguration, ParticleDefinition, ParticleValueConfiguration, Status } from './models';
type ObjectInstance = any;
export declare class IracaContainer {
    readonly pendingParticles: Map<string, ParticleConfiguration[]>;
    configsTable: Map<string, ParticleDefinition>;
    instancesDependencyTable: Map<string, Array<{
        generatedBy: string;
        instance: ObjectInstance;
    }>>;
    constructor();
    size(): number;
    addAll(container: IracaContainer): void;
    add(config: Omit<GenericParticleConfiguration, 'id'> | Omit<AbstractParticleConfiguration, 'id'>): boolean;
    makeInstance(typeClass: any, config: ParticleConfiguration, state: {
        foundDependencies: {
            [dependencyName: string]: ParticleDefinition;
        };
        notFoundDependencies: string[];
        status: Status;
    }): void;
    _add(config: ParticleConfiguration): boolean;
    addValue(config: ParticleValueConfiguration): void;
    private getStateByDependencies;
    getInstance<T>(instanceClass: any, parentId?: string): any;
    private resolveDependentParticles;
    private addPending;
}
export {};
