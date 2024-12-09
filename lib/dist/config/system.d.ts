/// <reference types="node" />
import { EventEmitter } from 'node:events';
import { IracaContainer } from '../dependency-injection/container';
export type EventName = `${string}DomainEvent`;
export declare function DomainEventKind(name: EventName): DomainEventKind;
export interface DomainEventKind {
    name: EventName;
    build: Function;
}
export declare class DomainEvent<P = any> {
    domainEventKind: DomainEventKind;
    payload?: P | undefined;
    id: Symbol;
    name: EventName;
    constructor(domainEventKind: DomainEventKind, payload?: P | undefined);
    makeId(): symbol;
}
export declare abstract class Usecase<Param = any, Response = any> {
    static identifier: string;
    static eventKinds: DomainEventKind[];
    abstract call(param?: Param): DomainEvent<Response> | Promise<DomainEvent<Response>>;
}
export interface EventRegister {
    timestamp: Date;
    domainEvent: DomainEvent;
}
export declare class Iraca extends EventEmitter {
    dependenciesContainer: IracaContainer;
    eventsRegistry: Map<Symbol, EventRegister>;
    constructor(dependenciesContainer: IracaContainer);
    notify(domainEvent: DomainEvent): void;
    register(usecase: any): void;
}
