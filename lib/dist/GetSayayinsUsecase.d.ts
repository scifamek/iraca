import { DomainEvent, Usecase } from './config/system';
import { MyUsecaseB } from './MyUsecaseB';
export type MyParam = [string, string];
export declare class GetSayayinsUsecase extends Usecase<MyParam, number> {
    private myUsecaseB;
    static events: string[];
    static identifier: string;
    constructor(myUsecaseB: MyUsecaseB);
    call(param: MyParam): DomainEvent<number>;
}
