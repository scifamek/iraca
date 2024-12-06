import { AbstractParticleConfiguration, GenericParticleConfiguration, ParticleConfiguration, ParticleDefinition, ParticleValueConfiguration, Status } from './models';
export declare class IracaContainer {
    readonly pendingParticles: Map<string, ParticleConfiguration[]>;
    configsTable: Map<string, ParticleDefinition>;
    instancesTable: Map<string, Array<{
        generatedBy: string;
        instance: any;
    }>>;
    constructor();
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
    getInstance<T>(id: string, parentId?: string): T;
    private resolveDependentParticles;
    private addPending;
}
