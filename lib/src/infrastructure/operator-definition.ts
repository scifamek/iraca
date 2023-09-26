import { Observable } from 'rxjs';

export function permissiveEqualOperator<T>(key: string, value: string): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>) => {
    return new Observable((suscriber) => {
      source.subscribe({
        next: (items: T) => {
          suscriber.next(
            (items as unknown as Array<any>).filter((item) => {
              return (item[key] as string)?.toUpperCase() === value.toUpperCase();
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

export const OPERATORS_HANDLER_MAPPER: {
  [index: string]: (key: string, value: string) => (source: Observable<any>) => Observable<any>;
} = {
  '=': permissiveEqualOperator,
  contains: containsOperator,
};



