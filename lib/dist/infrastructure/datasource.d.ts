import { Filters } from '../domain';
import { CompositeFilters } from '../domain/filters';
export interface DataSourceFilter {
    equals?: any;
    property: string;
}
export declare abstract class DataSource<T> {
    private _entity;
    get entity(): string;
    set entity(value: string);
    abstract deleteById(id: string): Promise<void>;
    abstract getByFilter(config?: {
        filters?: CompositeFilters | Filters;
        pagination?: {
            pageSize: number;
            pageNumber: number;
        };
    }): Promise<T[]>;
    abstract getById(id: string): Promise<T | undefined>;
    abstract save(entity: any): Promise<string>;
    abstract update(id: string, entity: T): Promise<T>;
}
