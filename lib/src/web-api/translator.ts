import { Observable, of, zip } from 'rxjs';
import { map } from 'rxjs/operators';

export abstract class Traslator<E> {
  attributes: {
    [index: string]: {
      name: string;
      to?: Function;
      from?: (value: any) => Observable<any>;
      default?: any;
    };
  };

  constructor() {
    this.attributes = {};
  }

  fromJson(obj: any): Observable<E | undefined> {
    const values = Object.values(this.attributes);
    const keys = Object.keys(this.attributes);
    const newKeys: Observable<{ key: string; value: any }>[] = [];
    if (!obj) {
      return of(undefined);
    }
    for (let index = 0; index < values.length; index++) {
      const config = values[index];

      const value: string = config.name;
      const key: string = keys[index];

      let mappedValue: Observable<{ key: string; value: any }> | undefined = undefined;
      if (config.from) {
        if (obj[value] !== undefined) {
          mappedValue = config.from(obj[value]).pipe(
            map((val) => {
              return {
                key,
                value: val,
              };
            })
          );
        } else if (config.default != undefined) {
          mappedValue = of(config.default).pipe(
            map((val) => {
              return {
                key,
                value: val,
              };
            })
          );
        } else {
          mappedValue = undefined;
        }
      } else {
        if (obj[value] !== undefined) {
          mappedValue = of({
            key,
            value: obj[value],
          });
        } else if (config.default !== undefined) {
          mappedValue = of({
            key,
            value: config.default,
          });
        } else {
          mappedValue = undefined;
        }
      }
      if (mappedValue) {
        newKeys.push(mappedValue);
      }
    }
    return newKeys.length > 0
      ? zip(...newKeys).pipe(
          map((mappedAttributes) => {
            const result: any = {};
            for (const mappedAttribute of mappedAttributes) {
              result[mappedAttribute.key] = mappedAttribute.value;
            }
            return result as E;
          })
        )
      : of({} as unknown as E);
  }

  toJson(obj: E): any {
    const values = Object.values(this.attributes);
    const keys = Object.keys(this.attributes);
    const result: any = {} as E;
    for (let index = 0; index < values.length; index++) {
      const config = values[index];
      const value: string = values[index].name;
      const key: string = keys[index];

      let mappedValue = undefined;

      if ((obj as any)[key] === undefined) {
        if (config.default !== undefined) {
          mappedValue = config.default;
        }
      } else {
        mappedValue = (obj as any)[key];
        if (config.to) {
          mappedValue = config.to((obj as any)[key]);
        }
      }

      if (mappedValue !== undefined) {
        result[value] = mappedValue;
      }
    }
    return result as E;
  }
}
