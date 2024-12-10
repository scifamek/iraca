import { AbstractParticleConfiguration, GenericParticleConfiguration, ParticleConfiguration, ParticleDefinition, ParticleValueConfiguration } from './models';
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
    addByPattern(dirname: string, pattern: RegExp): Promise<string[]>;
    add(config: Omit<GenericParticleConfiguration, 'id'> | Omit<AbstractParticleConfiguration, 'id'>): boolean;
    private _add;
    addValue(config: ParticleValueConfiguration): void;
    private getStateByDependencies;
    getInstance<TT>(instanceClass: any, parentId?: string): TT;
    private resolveDependentParticles;
    private addPending;
}
export {};
