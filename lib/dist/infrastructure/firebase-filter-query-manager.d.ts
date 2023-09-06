import { DocumentData, Query } from 'firebase-admin/firestore';
import { Observable } from 'rxjs';
import { Mapper } from './mapper';
export type FirebaseFilterOperators = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'not-in' | 'array-contains-any';
export type CustomFilterOperators = '=' | 'contains';
export declare const CustomFilterOperators: string[];
export type Operators = FirebaseFilterOperators | CustomFilterOperators;
export interface Filter {
    operator: Operators;
    value: any;
}
export interface Filters {
    [index: string]: Filter | Filter[];
}
export declare function makeFilters(data: any, operator?: Operators): Filters;
export declare function permissiveEqualOperator<T>(key: string, value: string): (source: Observable<T>) => Observable<T>;
export declare function containsOperator<T>(key: string, value: string): (source: Observable<T>) => Observable<T>;
export declare function filterWizard<T>(query: Query<DocumentData>, filters?: Filters, mapper?: Mapper<T>): {
    query: Query<DocumentData>;
    pipe: ((source: Observable<any>) => Observable<any>)[];
};
