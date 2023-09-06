import { Observable } from 'rxjs';
import { Filters } from './implementations/firebase-filter-query-manager';
export interface DataSourceFilter {
    equals?: any;
    property: string;
}
export declare abstract class DataSource<T> {
    private _entity;
    get entity(): string;
    set entity(value: string);
    abstract deleteById(id: string): Observable<void>;
    abstract getByFilter(config?: {
        filters?: Filters;
        pagination?: {
            pageSize: number;
            pageNumber: number;
        };
    }): Observable<T[]>;
    abstract getById(id: string): Observable<T | undefined>;
    abstract save(entity: any): Observable<string>;
    abstract update(id: string, entity: T): Observable<T>;
}
