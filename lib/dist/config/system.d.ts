/// <reference types="node" />
import { EventEmitter } from 'node:events';
import { IracaContainer } from '../dependency-injection/container';
export declare class DomainEvent<P = any> {
    name: string;
    payload?: P | undefined;
    id: Symbol;
    constructor(name: string, payload?: P | undefined);
    makeId(): symbol;
}
export declare abstract class Usecase<Param = any, Response = any> {
    static identifier: string;
    static events: string[];
    abstract call(param?: Param): DomainEvent<Response>;
}
export interface EventRegister {
    timestamp: Date;
    payload: any;
}
export declare class Iraca extends EventEmitter {
    dependenciesContainer: IracaContainer;
    eventsRegistry: Map<Symbol, EventRegister>;
    constructor(dependenciesContainer: IracaContainer);
    notify(domainEvent: DomainEvent): void;
    register(usecase: any): void;
}
