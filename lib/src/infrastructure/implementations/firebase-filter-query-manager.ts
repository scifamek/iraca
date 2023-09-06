import { DocumentData, Query } from 'firebase-admin/firestore';
import { Observable } from 'rxjs';
import { Mapper } from '../mapper';

export type FirebaseFilterOperators = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'not-in' | 'array-contains-any';

export type CustomFilterOperators = '=' | 'contains';
export const CustomFilterOperators = ['=', 'contains'];

export type Operators = FirebaseFilterOperators | CustomFilterOperators;

export interface Filter {
  operator: Operators;
  value: any;
}
export interface Filters {
  [index: string]: Filter | Filter[];
}

export function makeFilters(data: any, operator: Operators = 'contains') {
  const response: Filters = {};

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];

      response[key] = {
        operator,
        value,
      };
    }
  }
  return response;
}

export function permissiveEqualOperator<T>(key: string, value: string): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>) => {
    return new Observable((suscriber) => {
      source.subscribe({
        next: (items: T) => {
          suscriber.next(
            (items as unknown as Array<any>).filter((item) => {
              return (item[key] as string).toUpperCase() === value.toUpperCase();
            }) as unknown as T
          );
        },
        error: () => suscriber.error(),
        complete: () => suscriber.complete(),
      });
    });
  };
}

export function containsOperator<T>(key: string, value: string): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>) => {
    return new Observable((suscriber) => {
      source.subscribe({
        next: (items: T) => {
          suscriber.next(
            (items as unknown as Array<any>).filter((item) => {
              return (item[key] as string).toUpperCase().includes(value.toUpperCase());
            }) as unknown as T
          );
        },
        error: () => {
          return suscriber.error();
        },
        complete: () => suscriber.complete(),
      });
    });
  };
}

const operatorsHandlerMapper: {
  [index: string]: (key: string, value: string) => (source: Observable<any>) => Observable<any>;
} = {
  '=': permissiveEqualOperator,
  contains: containsOperator,
};

export function filterWizard<T>(query: Query<DocumentData>, filters?: Filters, mapper?: Mapper<T>) {
  const customOperators: ((source: Observable<any>) => Observable<any>)[] = [];
  if (filters)
    for (const key in filters) {
      const config = filters[key];
      if (Array.isArray(config)) {
        for (const innerConfig of config) {
          query = _map(key, innerConfig, query);
        }
      } else {
        query = _map(key, config, query);
      }
    }

  const response = {
    query,
    pipe: customOperators,
  };
  return response;

  function _map(
    key: string,
    config: {
      operator: FirebaseFilterOperators | CustomFilterOperators;
      value: any;
    },
    query: Query<DocumentData>
  ) {
    let transformKey = key;

    if (!!mapper) {
      if (!mapper.attributesMapper[key]) {
      } else {
        transformKey = mapper.attributesMapper[key].name;
      }
    }

    if (CustomFilterOperators.indexOf(config.operator) == -1) {
      query = query.where(transformKey, config.operator as FirebaseFilterOperators, config.value);
      return query;
    } else {
      const handler = operatorsHandlerMapper[config.operator];
      if (handler) {
        customOperators.push(handler(transformKey, config.value));
      }
    }
    return query;
  }
}
