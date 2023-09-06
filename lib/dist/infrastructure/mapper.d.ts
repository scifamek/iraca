import { Observable } from 'rxjs';
export declare abstract class Mapper<T> {
    attributesMapper: {
        [index: string]: {
            name: string;
            to?: Function;
            from?: (value: any) => Observable<any>;
            default?: any;
        };
    };
    constructor();
    fromJson(obj: any): Observable<T | undefined>;
    toJson(obj: T): any;
}
