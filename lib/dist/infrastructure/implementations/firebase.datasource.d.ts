import { Firestore } from 'firebase-admin/firestore';
import { Observable } from 'rxjs';
import { Filters } from './firebase-filter-query-manager';
import { DataSource } from '../datasource';
export declare class FirebaseDataSource<T> extends DataSource<T> {
    db: Firestore;
    constructor(db: Firestore);
    deleteById(id: string): Observable<void>;
    getByFilter(config?: {
        filters?: Filters;
        pagination?: {
            pageSize: number;
            pageNumber: number;
        };
    }): Observable<T[]>;
    getById(id: string): Observable<T | undefined>;
    save(entity: any): Observable<string>;
    update(id: string, entity: any): Observable<any>;
}
