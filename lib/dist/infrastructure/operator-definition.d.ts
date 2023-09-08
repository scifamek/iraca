import { Observable } from 'rxjs';
export declare function permissiveEqualOperator<T>(key: string, value: string): (source: Observable<T>) => Observable<T>;
export declare function containsOperator<T>(key: string, value: string): (source: Observable<T>) => Observable<T>;
export declare const OPERATORS_HANDLER_MAPPER: {
    [index: string]: (key: string, value: string) => (source: Observable<any>) => Observable<any>;
};
