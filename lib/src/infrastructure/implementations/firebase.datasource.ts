import { DocumentData, DocumentReference, DocumentSnapshot, Firestore, Query, QuerySnapshot } from 'firebase-admin/firestore';
import { from, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Filters, filterWizard } from './firebase-filter-query-manager';
import { DataSource } from '../datasource';

export class FirebaseDataSource<T> extends DataSource<T> {
  constructor(public db: Firestore) {
    super();
  }

  deleteById(id: string): Observable<void> {
    const entitySnapshot = this.db.collection(this.entity).doc(id);
    return from(entitySnapshot.delete()).pipe(
      map(() => {
        return;
      })
    );
  }

  getByFilter(config?: { filters?: Filters; pagination?: { pageSize: number; pageNumber: number } }): Observable<T[]> {
    let query: Query<DocumentData> = this.db.collection(this.entity);

    const filters = config?.filters;

    const pagination = config?.pagination;

    if (!!pagination) {
      if (pagination.pageNumber != 0) {
        query = query.orderBy('id').limit((pagination.pageNumber + 1) * pagination.pageSize);

        return from(query.get()).pipe(
          map((items: QuerySnapshot<DocumentData>) => {
            return items.docs
              .map(
                (item) =>
                  ({
                    ...item.data(),
                    id: item.id,
                  } as unknown as T)
              )
              .pop();
          }),
          map((last: T | undefined) => {
            if (last) {
              query = query.startAfter((last as any).id).limit(pagination.pageSize);
            }
            return query;
          }),
          mergeMap((query) => {
            return from(query.get()).pipe(
              map((items: QuerySnapshot<DocumentData>) => {
                return items.docs.map(
                  (item) =>
                    ({
                      ...item.data(),
                      id: item.id,
                    } as unknown as T)
                );
              })
            );
          })
        );
      } else {
        query = query.limit(pagination.pageSize);

        return from(query.get()).pipe(
          map((items: QuerySnapshot<DocumentData>) => {
            return items.docs.map(
              (item) =>
                ({
                  ...item.data(),
                  id: item.id,
                } as unknown as T)
            );
          })
        );
      }
    }
    const computedFilters = filterWizard(query, filters);
    query = computedFilters.query;
    let $query = from(query.get()).pipe(
      map((items: QuerySnapshot<DocumentData>) => {
        return items.docs.map(
          (item) =>
            ({
              ...item.data(),
              id: item.id,
            } as unknown as T)
        );
      })
    );
    for (const pipe of computedFilters.pipe) {
      $query = $query.pipe(pipe);
    }
    return $query;
  }

  getById(id: string): Observable<T | undefined> {
    return from(this.db.collection(this.entity).doc(id).get()).pipe(
      map((item: DocumentSnapshot<DocumentData>) => {
        return item.data()
          ? ({
              ...item.data(),
              id: item.id,
            } as unknown as T)
          : undefined;
      })
    );
  }

  save(entity: any): Observable<string> {
    return from(this.db.collection(this.entity).add(entity)).pipe(
      map((snapshot: DocumentReference<DocumentData>) => {
        return snapshot.id;
      })
    );
  }

  update(id: string, entity: any): Observable<any> {
    const docReference = this.db.collection(this.entity).doc(id);
    return from(docReference.update(entity));
  }
}
