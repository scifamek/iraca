import { Observable, OperatorFunction } from 'rxjs';
import { DataSource } from './datasource';
import { Mapper } from './mapper';
import { CompositeFilters, Filters } from '../domain';
export declare abstract class TransversalContract<Entity> {
    protected dataSource: DataSource<Entity>;
    protected mapper: Mapper<Entity>;
    entity: string;
    constructor(dataSource: DataSource<Entity>, mapper: Mapper<Entity>);
    delete(id: string): Observable<void>;
    filter(filter: Filters | CompositeFilters): Observable<Array<Entity>>;
    get(pagination?: {
        pageNumber: number;
        pageSize: number;
    }): Observable<Entity[]>;
    getById(id: string): Observable<Entity | undefined>;
    mapItems(): OperatorFunction<Entity[], Entity[]>;
    refreshEntity(): void;
    save(entity: Entity): Observable<string>;
    update(id: string, entity: Entity): Observable<Entity>;
}
