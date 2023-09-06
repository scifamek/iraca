import { ParticleDefinition, ParticleConfiguration, ParticleValueConfiguration, Snapshot } from './models';
export declare class Container {
    pending: {
        [pendingId: string]: (ParticleConfiguration | null)[];
    };
    table: {
        [index: string]: ParticleDefinition<any>;
    };
    constructor();
    addAll(container: Container): void;
    add(config: ParticleConfiguration): boolean;
    _add(config: ParticleConfiguration): boolean;
    addValue(config: ParticleValueConfiguration): void;
    private getStateByDependencies;
    getInstance<T>(id: string): Snapshot<T>;
    private removeEmptyPendings;
    private resolveDependentParticles;
    private addPending;
}
