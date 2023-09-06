export type Status = 'resolved' | 'pending' | 'no-resolved';
export type Particle = any;
export interface ParticleConfiguration {
    dependencies?: string[];
    id: string;
    kind: any;
    override?: any;
    strategy: 'singleton' | 'factory';
}
export interface ParticleValueConfiguration {
    id: string;
    value: any;
}
export interface ParticleDefinition<T> {
    constructor: Function | null;
    snapshot: Snapshot<T>;
}
export interface Snapshot<T> {
    instance: T | null;
    status: Status;
}
