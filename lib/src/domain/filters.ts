export type Operator = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'not-in' | 'array-contains-any' | '=' | 'contains';
export const FilterOperators = ['<', '<=', '==', '!=', '>=', '>', 'array-contains', 'in', 'not-in', 'array-contains-any', '=', 'contains'];

export interface Filter {
  operator: Operator;
  value: any;
}
export interface Filters {
  [index: string]: Filter | Filter[];
}

export function makeFilters(data: any, operator: Operator = 'contains') {
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
