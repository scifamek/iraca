import { DomainEvent, Usecase } from './config/system';
export declare class MyUsecaseB extends Usecase<any, number> {
    static events: string[];
    static identifier: string;
    constructor();
    call(param: any): DomainEvent<number>;
}
