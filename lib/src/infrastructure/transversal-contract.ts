import { Observable, OperatorFunction, of, zip } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { DataSource } from './datasource';
import { Mapper } from './mapper';
import { Filters } from './implementations/firebase-filter-query-manager';

export abstract class TransversalContract<Entity> {
  entity!: string;

  constructor(protected dataSource: DataSource<Entity>, protected mapper: Mapper<Entity>) {}

  delete(id: string): Observable<void> {
    this.refreshEntity();
    return this.dataSource.deleteById(id);
  }

  filter(filter: Filters): Observable<Array<Entity>> {
    this.refreshEntity();
    const mappedFilters = { ...filter };
    for (const key in filter) {
      if (Object.prototype.hasOwnProperty.call(filter, key)) {
        const element = filter[key];
        delete mappedFilters[key];
        mappedFilters[this.mapper.attributesMapper[key].name] = element;
      }
    }
    return this.dataSource
      .getByFilter({
        filters: mappedFilters,
      })
      .pipe(this.mapItems());
  }

  get(pagination?: { pageNumber: number; pageSize: number }): Observable<Entity[]> {
    this.refreshEntity();

    return this.dataSource
      .getByFilter({
        pagination,
      })
      .pipe(this.mapItems());
  }

  getById(id: string): Observable<Entity | undefined> {
    this.refreshEntity();
    return this.dataSource.getById(id).pipe(
      mergeMap((group: Entity | undefined) => {
        return !!group ? this.mapper.fromJson(group) : of(group);
      })
    );
  }

  mapItems(): OperatorFunction<Entity[], Entity[]> {
    return mergeMap((items: Entity[]) => {
      return items.length > 0
        ? zip(
            ...items.map((item) => {
              return this.mapper.fromJson(item).pipe(filter((item) => !!item)) as Observable<Entity>;
            })
          ).pipe(
            map((items) => {
              return items;
            })
          )
        : of([]);
    });
  }

  refreshEntity() {
    this.dataSource.entity = this.entity;
  }

  save(entity: Entity): Observable<string> {
    this.refreshEntity();
    return this.dataSource.save(this.mapper.toJson(entity));
  }

  update(id: string, entity: Entity): Observable<Entity> {
    this.refreshEntity();
    return this.dataSource.update(id, this.mapper.toJson(entity)).pipe(map(() => entity));
  }
}
