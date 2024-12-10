export declare abstract class Mapper<T> {
    attributesMapper: {
        [index: string]: {
            name: string;
            to?: Function;
            from?: (value: any) => Promise<any>;
            default?: any;
        };
    };
    constructor();
    fromJson(obj: any): Promise<T | undefined>;
    toJson(obj: T): any;
}
