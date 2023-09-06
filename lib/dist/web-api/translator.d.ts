import { Observable } from 'rxjs';
export declare abstract class Traslator<E> {
    attributes: {
        [index: string]: {
            name: string;
            to?: Function;
            from?: (value: any) => Observable<any>;
            default?: any;
        };
    };
    constructor();
    fromJson(obj: any): Observable<E | undefined>;
    toJson(obj: E): any;
}
